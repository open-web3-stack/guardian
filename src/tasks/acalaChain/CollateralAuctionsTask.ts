import Joi from '@hapi/joi';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, map, flatMap, filter } from 'rxjs/operators';
import { Option } from '@polkadot/types/codec';
import { AuctionInfo } from '@open-web3/orml-types/interfaces';
import { CollateralAuctionItem } from '@acala-network/types/interfaces';
import AcalaTask from './AcalaTask';
import { getAuctionsIds, unwrapOptionalCodec } from './helpers';

export type Output = {
  account: string;
  currencyId: string;
  auctionId: number;
  amount: string;
  target: string;
  startTime: number;
  endTime: number;
  lastBidder: string | null;
  lastBid: string | null;
};

export default class CollateralAuctionsTask extends AcalaTask<Output> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  init(params: { account: string | string[]; currencyId: string | string[] }) {
    const { account, currencyId } = params;

    const fulfillAccount = CollateralAuctionsTask.fulfillArguments(account);
    const fulfillCurrencyId = CollateralAuctionsTask.fulfillArguments(currencyId);

    return this.api$.pipe(
      switchMap((api) =>
        getAuctionsIds(api).pipe(
          flatMap((auctionId) =>
            combineLatest([
              unwrapOptionalCodec(api.query.auction.auctions(auctionId) as Observable<Option<AuctionInfo>>),
              unwrapOptionalCodec(
                api.query.auctionManager.collateralAuctions(auctionId) as Observable<Option<CollateralAuctionItem>>
              ),
            ]).pipe(
              filter(([, collateralAuction]) => {
                const account = collateralAuction.owner.toString();
                const currencyId = collateralAuction.currencyId.toString();
                return fulfillAccount(account) && fulfillCurrencyId(currencyId);
              }),
              map(([auction, collateralAuction]) => {
                let lastBidder = null;
                let lastBid = null;
                if (auction.bid.isSome) {
                  [lastBidder, lastBid] = auction.bid.unwrap();
                }

                return {
                  account: collateralAuction.owner.toString(),
                  currencyId: collateralAuction.currencyId.toString(),
                  auctionId,
                  amount: collateralAuction.amount.toString(),
                  target: collateralAuction.target.toString(),
                  startTime: Number.parseInt(collateralAuction.startTime.toString()),
                  endTime: auction.end.isSome ? Number.parseInt(auction.end.toString()) : null,
                  lastBidder: lastBidder ? lastBidder.toString() : null,
                  lastBid: lastBid ? lastBid.toString() : null,
                };
              })
            )
          )
        )
      )
    );
  }

  static fulfillArguments = (source: string | string[]) => (input: string): boolean => {
    if (source === 'all') {
      return true;
    } else if (typeof source === 'string') {
      return source === input;
    } else {
      return source.includes(input);
    }
  };
}
