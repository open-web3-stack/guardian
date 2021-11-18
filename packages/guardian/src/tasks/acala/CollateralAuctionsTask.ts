import Joi from 'joi';
import { castArray } from 'lodash';
import { drr } from '@polkadot/rpc-core';
import { combineLatest, of, range } from 'rxjs';
import { mergeMap, map, filter, switchMap, pairwise, concatWith, distinctUntilChanged } from 'rxjs/operators';
import { CollateralAuction } from '@open-web3/guardian/types';
import { AcalaGuardian } from '../../guardians';
import Task from '../Task';

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
    const { apiRx } = await guardian.isReady();

    const { account, currencyId } = this.arguments;

    const whitelist = apiRx.consts.cdpEngine.collateralCurrencyIds.map((x) => x.asToken.toString());

    // make sure provided currency id is whitelisted
    if (currencyId !== 'all') {
      castArray(currencyId).forEach((id) => {
        if (!whitelist.includes(id)) throw Error('Collateral currency id not allowed!');
      });
    }

    const fulfillAccount = this.fulfillArguments(account);
    const fulfillCurrencyId = this.fulfillArguments(currencyId === 'all' ? whitelist : currencyId);

    const upcomingAuctions$ = apiRx.query.auction.auctionsIndex().pipe(
      pairwise(),
      filter(([, next]) => !next.isZero()),
      switchMap(([prev, next]) => range(prev.toNumber(), next.toNumber())),
      distinctUntilChanged(),
      mergeMap((auctionId) => {
        return combineLatest([
          of(auctionId),
          apiRx.query.auctionManager.collateralAuctions(auctionId),
          apiRx.query.auction.auctions(auctionId)
        ]);
      })
    );

    return apiRx.query.auctionManager.collateralAuctions.entries().pipe(
      mergeMap((entry) => entry),
      mergeMap((entry) => {
        const [storageKey, maybecollateralAuction] = entry;
        const [auctionId] = storageKey.args;
        return combineLatest([of(auctionId), of(maybecollateralAuction), apiRx.query.auction.auctions(auctionId)]);
      }),
      concatWith(upcomingAuctions$),
      filter(([, maybecollateralAuction, maybeAuction]) => {
        if (maybecollateralAuction.isNone) return false;
        if (maybeAuction.isNone) return false;

        const { refundRecipient, currencyId } = maybecollateralAuction.unwrap();
        if (!fulfillAccount(refundRecipient.toString())) return false;
        if (!fulfillCurrencyId(currencyId.asToken.toString())) return false;

        return true;
      }),
      map(([auctionId, maybecollateralAuction, maybeAuction]) => {
        const collateralAuction = maybecollateralAuction.unwrap();
        const auction = maybeAuction.unwrap();

        const [lastBidder, lastBid] = auction.bid.isSome ? auction.bid.unwrap() : [];

        return {
          account: collateralAuction.refundRecipient.toString(),
          currencyId: collateralAuction.currencyId.asToken.toString(),
          auctionId: Number(auctionId.toString()),
          initialAmount: collateralAuction.initialAmount.toString(),
          amount: collateralAuction.amount.toString(),
          target: collateralAuction.target.toString(),
          startTime: Number(collateralAuction.startTime.toString()),
          endTime: auction.end.isSome ? Number(auction.end.toString()) : undefined,
          lastBidder: lastBidder && lastBidder.toString(),
          lastBid: lastBid && lastBid.toString()
        };
      }),
      drr()
    );
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
