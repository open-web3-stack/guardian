import Joi from '@hapi/joi';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, map, flatMap } from 'rxjs/operators';
import { Option } from '@polkadot/types/codec';
import { AuctionInfo } from '@open-web3/orml-types/interfaces';
import { SurplusAuctionItem } from '@acala-network/types/interfaces';
import AcalaTask from './AcalaTask';
import { getAuctionsIds, unwrapOptionalCodec } from './helpers';

export type Output = {
  auctionId: number;
  amount: string;
  startTime: number;
  endTime: number;
};

export default class SurplusAuctionsTask extends AcalaTask<Output> {
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
                return {
                  auctionId,
                  amount: surplus.amount.toString(),
                  startTime: Number.parseInt(surplus.startTime.toString()),
                  endTime: auction.end.isSome ? Number.parseInt(auction.end.toString()) : null,
                };
              })
            );
          })
        )
      )
    );
  }
}
