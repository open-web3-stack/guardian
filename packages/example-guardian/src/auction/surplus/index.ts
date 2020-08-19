#!/usr/bin/env node

import { calcTargetInBaseToOther, Fixed18 } from '@acala-network/app-util';
import { concatMap } from 'rxjs/operators';
import { SurplusAuction, Event } from '@open-web3/guardian/types';
import config from '../config';
import setupApi from '../setupApi';
import { registerActions } from './registerActions';
import { setDefaultConfig, logger } from '../../utils';
import { calculateBid } from '../calculateBid';

const run = async () => {
  setDefaultConfig('surplus-auction-guardian.yml');

  const { nodeEndpoint, address, margin, SURI } = config();

  const { surplusAuctionDealt$, surplusAuctions$, getBalance, getPool } = registerActions();

  const { exchangeFee, slippage, bid, swap } = await setupApi(nodeEndpoint, SURI, address);

  const onAuction = async (auction: SurplusAuction) => {
    const balance = await getBalance();
    const pool = await getPool();

    const ourBid = calculateBid(auction, pool.price, balance.free, margin);

    const { blockHash, txHash } = await bid(auction.auctionId, ourBid.toFixed(0));
    logger.log('Bid sent: ', { blockHash: blockHash.toHex(), txHash: txHash.toHex() });
  };

  const onAuctionDealt = async (event: Event) => {
    const pool = await getPool();
    const amountHex = event.args['surplus_amount'] || event.args['arg2'];

    const amount = Fixed18.fromParts(Number(amountHex));

    const target = calcTargetInBaseToOther(
      amount,
      {
        other: Fixed18.fromParts(pool.otherLiquidity),
        base: Fixed18.fromParts(pool.baseLiquidity),
      },
      exchangeFee,
      slippage
    );

    const { blockHash, txHash } = await swap('AUSD', amount.innerToString(), 'ACA', target.innerToString());
    logger.log('Swap sent: ', { blockHash: blockHash.toHex(), txHash: txHash.toHex() });
  };

  surplusAuctions$
    .pipe(concatMap(async (auction) => await onAuction(auction).catch((e) => logger.error(e))))
    .subscribe();

  surplusAuctionDealt$
    .pipe(concatMap(async (event) => await onAuctionDealt(event).catch((e) => logger.error(e))))
    .subscribe();

  // start guardian
  require('@open-web3/guardian-cli');
};

export default run;

// if called directly
if (require.main === module) {
  run().catch((error) => {
    logger.error(error);
    process.exit(-1);
  });
}
