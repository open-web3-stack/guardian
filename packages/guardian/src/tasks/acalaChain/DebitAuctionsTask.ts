import Joi from 'joi';
import { DebitAuction } from '@open-web3/guardian/types';
import { AcalaGuardian } from '@open-web3/guardian/guardians';
import Task from '../Task';
import { autorun$ } from '../../utils';

export default class DebitAuctionsTask extends Task<Record<string, unknown>, DebitAuction> {
  validationSchema() {
    return Joi.any();
  }

  async start(guardian: AcalaGuardian) {
    const { storage } = await guardian.isReady();

    return autorun$<DebitAuction>((subscriber) => {
      const debitAuctions = storage.auctionManager.debitAuctions.entries();
      for (const [auctionId, debitAuctionWrapped] of debitAuctions.entries()) {
        if (debitAuctionWrapped.isEmpty) continue;
        const debitAuction = debitAuctionWrapped.unwrap();

        const auctionWrapped = storage.auction.auctions(auctionId);
        if (!auctionWrapped?.isSome) continue;
        const auction = auctionWrapped.unwrap();

        const [lastBidder, lastBid] = auction.bid.isSome ? auction.bid.unwrap() : [];

        subscriber.next({
          auctionId: Number(auctionId),
          initialAmount: debitAuction.initialAmount.toString(),
          amount: debitAuction.amount.toString(),
          fix: debitAuction.fix.toString(),
          startTime: Number(debitAuction.startTime.toString()),
          endTime: auction.end.isSome ? Number(auction.end.toString()) : null,
          lastBidder: lastBidder ? lastBidder.toString() : null,
          lastBid: lastBid ? lastBid.toString() : null,
        });
      }
    });
  }
}
