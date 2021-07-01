import Joi from 'joi';
import { CollateralAuction } from '@open-web3/guardian/types';
import { AcalaGuardian } from '../../guardians';
import Task from '../Task';
import { Observable } from 'rxjs';
import { autorun, observe, Lambda } from 'mobx';

export default class CollateralAuctionsTask extends Task<
  { account: string | string[]; currencyId: string | string[] },
  CollateralAuction
> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required()
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx, storage } = await guardian.isReady();

    const { account, currencyId } = this.arguments;

    const whitelist = apiRx.consts.cdpEngine.collateralCurrencyIds.map((x) => x.asToken.toString());

    // make sure provided currency id is whitelisted
    if (currencyId !== 'all') {
      const currencyIds = Array.isArray(currencyId) ? currencyId : [currencyId];
      currencyIds.forEach((id) => {
        if (!whitelist.includes(id)) throw Error('Collateral currency id not allowed!');
      });
    }

    const fulfillAccount = this.fulfillArguments(account);
    const fulfillCurrencyId = this.fulfillArguments(currencyId === 'all' ? whitelist : currencyId);

    return new Observable<CollateralAuction>((subscriber) => {
      let disposeObserve: Lambda;
      const disposeAutorun = autorun(() => {
        disposeObserve = observe(storage.auctionManager.collateralAuctions.entries(), (change) => {
          if (change.type === 'delete') return;

          const { name: auctionId, newValue: maybeCollateralAuction } = change;
          if (maybeCollateralAuction.isNone) return;
          const collateralAuction = maybeCollateralAuction.unwrap();

          const { refundRecipient, currencyId } = collateralAuction;

          if (!fulfillAccount(refundRecipient.toString())) return;
          if (!fulfillCurrencyId(currencyId.asToken.toString())) return;

          autorun(() => {
            const maybeAuction = storage.auction.auctions(auctionId);

            if (!maybeAuction?.isSome) return;
            const auction = maybeAuction.unwrap();

            const [lastBidder, lastBid] = auction.bid.isSome ? auction.bid.unwrap() : [];

            subscriber.next({
              account: collateralAuction.refundRecipient.toString(),
              currencyId: collateralAuction.currencyId.asToken.toString(),
              auctionId: Number(auctionId),
              initialAmount: collateralAuction.initialAmount.toString(),
              amount: collateralAuction.amount.toString(),
              target: collateralAuction.target.toString(),
              startTime: Number(collateralAuction.startTime.toString()),
              endTime: auction.end.isSome ? Number(auction.end.toString()) : undefined,
              lastBidder: lastBidder && lastBidder.toString(),
              lastBid: lastBid && lastBid.toString()
            });
          });
        });
      });

      return () => {
        disposeObserve();
        disposeAutorun();
      };
    });
  }

  private fulfillArguments =
    (source: string | string[]) =>
    (input: string): boolean => {
      if (source === 'all') {
        return true;
      } else if (typeof source === 'string') {
        return source === input;
      } else {
        return source.includes(input);
      }
    };
}
