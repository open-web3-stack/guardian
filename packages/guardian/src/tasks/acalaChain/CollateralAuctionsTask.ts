import Joi from 'joi';
import { CollateralAuction } from '@open-web3/guardian/types';
import { AcalaGuardian } from '../../guardians';
import Task from '../Task';
import { autorun$ } from '../../utils';

export default class CollateralAuctionsTask extends Task<
  { account: string | string[]; currencyId: string | string[] },
  CollateralAuction
> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { storage } = await guardian.isReady();

    const { account, currencyId } = this.arguments;

    const fulfillAccount = this.fulfillArguments(account);
    const fulfillCurrencyId = this.fulfillArguments(currencyId);

    return autorun$<CollateralAuction>((subscriber) => {
      const collateralAuctions = storage.auctionManager.collateralAuctions.entries();
      for (const [auctionId, collateralAuctionWrapped] of collateralAuctions.entries()) {
        if (collateralAuctionWrapped.isEmpty) continue;
        const collateralAuction = collateralAuctionWrapped.unwrap();

        const { refundRecipient, currencyId } = collateralAuction;

        if (!fulfillAccount(refundRecipient.toString())) continue;
        if (!fulfillCurrencyId(currencyId.asToken.toString())) continue;

        const auctionWrapped = storage.auction.auctions(auctionId);
        if (!auctionWrapped?.isSome) continue;
        const auction = auctionWrapped.unwrap();

        const [lastBidder, lastBid] = auction.bid.isSome ? auction.bid.unwrap() : [];

        subscriber.next({
          account: collateralAuction.refundRecipient.toString(),
          currencyId: collateralAuction.currencyId.asToken.toString(),
          auctionId: Number(auctionId),
          initialAmount: collateralAuction.initialAmount.toString(),
          amount: collateralAuction.amount.toString(),
          target: collateralAuction.target.toString(),
          startTime: Number(collateralAuction.startTime.toString()),
          endTime: auction.end.isSome ? Number(auction.end.toString()) : null,
          lastBidder: lastBidder ? lastBidder.toString() : null,
          lastBid: lastBid ? lastBid.toString() : null,
        });
      }
    });
  }

  private fulfillArguments = (source: string | string[]) => (input: string): boolean => {
    if (source === 'all') {
      return true;
    } else if (typeof source === 'string') {
      return source === input;
    } else {
      return source.includes(input);
    }
  };
}
