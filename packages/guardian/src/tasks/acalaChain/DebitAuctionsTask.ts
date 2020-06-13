import Joi from '@hapi/joi';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, map, flatMap } from 'rxjs/operators';
import { Option } from '@polkadot/types/codec';
import { AuctionInfo } from '@open-web3/orml-types/interfaces';
import { DebitAuctionItem } from '@acala-network/types/interfaces';
import AcalaTask from './AcalaTask';
import { getAuctionsIds, unwrapOptionalCodec } from './helpers';

export type DebitAuction = {
  auctionId: number;
  amount: string;
  fix: string;
  startTime: number;
  endTime: number | null;
};

export default class DebitAuctionsTask extends AcalaTask<DebitAuction> {
  validationSchema() {
    return Joi.any();
  }

  init() {
    return this.api$.pipe(
      switchMap((api) =>
        getAuctionsIds(api).pipe(
          flatMap((auctionId) =>
            combineLatest(
              unwrapOptionalCodec(api.query.auction.auctions(auctionId) as Observable<Option<AuctionInfo>>),
              unwrapOptionalCodec(
                api.query.auctionManager.debitAuctions(auctionId) as Observable<Option<DebitAuctionItem>>
              )
            ).pipe(
              map(([auction, debitAuction]) => ({
                auctionId,
                amount: debitAuction.amount.toString(),
                fix: debitAuction.fix.toString(),
                startTime: Number.parseInt(debitAuction.startTime.toString()),
                endTime: auction.end.isSome ? Number.parseInt(auction.end.toString()) : null,
              }))
            )
          )
        )
      )
    );
  }
}
