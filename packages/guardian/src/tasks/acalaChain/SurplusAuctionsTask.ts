import Joi from '@hapi/joi';
import { combineLatest } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { Option } from '@polkadot/types/codec';
import { AuctionInfo, AccountId, Balance } from '@open-web3/orml-types/interfaces';
import { SurplusAuctionItem } from '@acala-network/types/interfaces';
import { getAuctionsIds, unwrapOptionalCodec } from './helpers';
import { SurplusAuction } from '../../types';
import Task from '../Task';
import { AcalaGuardian } from '../../guardians';

export default class SurplusAuctionsTask extends Task<{}, SurplusAuction> {
  validationSchema() {
    return Joi.any();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx } = await guardian.isReady();
    return getAuctionsIds(apiRx).pipe(
      flatMap((auctionId) => {
        return combineLatest([
          unwrapOptionalCodec(apiRx.query.auction.auctions<Option<AuctionInfo>>(auctionId)),
          unwrapOptionalCodec(apiRx.query.auctionManager.surplusAuctions<Option<SurplusAuctionItem>>(auctionId)),
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
    );
  }
}
