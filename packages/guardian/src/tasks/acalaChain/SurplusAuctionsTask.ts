import Joi from 'joi';
import { SurplusAuction } from '../../types';
import Task from '../Task';
import { AcalaGuardian } from '../../guardians';
import { autorun$ } from '../../utils';

export default class SurplusAuctionsTask extends Task<Record<string, unknown>, SurplusAuction> {
  validationSchema() {
    return Joi.any();
  }

  async start(guardian: AcalaGuardian) {
    const { storage } = await guardian.isReady();

    return autorun$<SurplusAuction>((subscriber) => {
      const surplusAuctions = storage.auctionManager.surplusAuctions.entries();
      for (const [auctionId, surplusAuctionWrapped] of surplusAuctions.entries()) {
        if (surplusAuctionWrapped.isEmpty) continue;
        const surplusAuction = surplusAuctionWrapped.unwrap();

        const auctionWrapped = storage.auction.auctions(auctionId);
        if (!auctionWrapped?.isSome) continue;
        const auction = auctionWrapped.unwrap();

        const [lastBidder, lastBid] = auction.bid.isSome ? auction.bid.unwrap() : [];

        subscriber.next({
          auctionId: Number(auctionId),
          amount: surplusAuction.amount.toString(),
          startTime: Number(surplusAuction.startTime.toString()),
          endTime: auction.end.isSome ? Number(auction.end.toString()) : null,
          lastBidder: lastBidder ? lastBidder.toString() : null,
          lastBid: lastBid ? lastBid.toString() : null,
        });
      }
    });
  }
}
