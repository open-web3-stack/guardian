import Joi from '@hapi/joi';
import { combineLatest } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { Option } from '@polkadot/types/codec';
import { AuctionInfo, AccountId, Balance } from '@open-web3/orml-types/interfaces';
import { DebitAuctionItem } from '@acala-network/types/interfaces';
import { getAuctionsIds, unwrapOptionalCodec } from './helpers';
import { DebitAuction } from '../../types';
import Task from '../Task';
import { AcalaGuardian } from '../../guardians';

export default class DebitAuctionsTask extends Task<{}, DebitAuction> {
  validationSchema() {
    return Joi.any();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx } = await guardian.isReady();

    return getAuctionsIds(apiRx).pipe(
      flatMap((auctionId) =>
        combineLatest(
          unwrapOptionalCodec(apiRx.query.auction.auctions<Option<AuctionInfo>>(auctionId)),
          unwrapOptionalCodec(apiRx.query.auctionManager.debitAuctions<Option<DebitAuctionItem>>(auctionId))
        ).pipe(
          map(([auction, debitAuction]) => {
            let lastBidder: AccountId | null = null;
            let lastBid: Balance | null = null;
            if (auction.bid.isSome) {
              [lastBidder, lastBid] = auction.bid.unwrap();
            }

            return {
              auctionId,
              amount: debitAuction.amount.toString(),
              fix: debitAuction.fix.toString(),
              startTime: Number.parseInt(debitAuction.startTime.toString()),
              endTime: auction.end.isSome ? Number.parseInt(auction.end.toString()) : null,
              lastBidder: lastBidder ? lastBidder.toString() : null,
              lastBid: lastBid ? lastBid.toString() : null,
            };
          })
        )
      )
    );
  }
}
