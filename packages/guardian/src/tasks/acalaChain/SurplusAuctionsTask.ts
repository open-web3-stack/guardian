import Joi from '@hapi/joi';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, map, flatMap } from 'rxjs/operators';
import { Option } from '@polkadot/types/codec';
import { AuctionInfo, AccountId, Balance } from '@open-web3/orml-types/interfaces';
import { SurplusAuctionItem } from '@acala-network/types/interfaces';
import AcalaTask from './AcalaTask';
import { getAuctionsIds, unwrapOptionalCodec } from './helpers';
import { SurplusAuction } from '../../types';

export default class SurplusAuctionsTask extends AcalaTask<SurplusAuction> {
  validationSchema() {
    return Joi.any();
  }

  init() {
    return this.api$.pipe(
      switchMap((api) =>
        getAuctionsIds(api).pipe(
          flatMap((auctionId) => {
            return combineLatest([
              unwrapOptionalCodec(api.query.auction.auctions(auctionId) as Observable<Option<AuctionInfo>>),
              unwrapOptionalCodec(
                api.query.auctionManager.surplusAuctions(auctionId) as Observable<Option<SurplusAuctionItem>>
              ),
            ]).pipe(
              map(([auction, surplus]) => {
                let lastBidder: AccountId | null = null;
                let lastBid: Balance | null = null;
                if (auction.bid.isSome) {
                  [lastBidder, lastBid] = auction.bid.unwrap();
                }

                return {
                  auctionId,
                  amount: surplus.amount.toString(),
                  startTime: Number.parseInt(surplus.startTime.toString()),
                  endTime: auction.end.isSome ? Number.parseInt(auction.end.toString()) : null,
                  lastBidder: lastBidder ? lastBidder.toString() : null,
                  lastBid: lastBid ? lastBid.toString() : null,
                };
              })
            );
          })
        )
      )
    );
  }
}
