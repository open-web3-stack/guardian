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

  const { surplusAuctionDealed$, surplusAuctions$, getBalance, getPool } = registerActions();

  const { exchangeFee, slippage, bid, swap } = await setupApi(nodeEndpoint, SURI, address);

  const onAuction = async (auction: SurplusAuction) => {
    const balance = await getBalance();
    const pool = await getPool();

    const ourBid = calculateBid(auction, pool.price, balance.free, margin);

    const result = await bid(auction.auctionId, ourBid.toFixed(0));
    logger.log('Bid sent: ', JSON.stringify(result));
  };

  const onAuctionDealed = async (event: Event) => {
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

    const result = await swap('AUSD', amount.innerToString(), 'ACA', target.innerToString());
    logger.log('Swap sent: ', JSON.stringify(result));
  };

  surplusAuctions$
    .pipe(concatMap(async (auction) => await onAuction(auction).catch((e) => logger.error(e))))
    .subscribe();

  surplusAuctionDealed$
    .pipe(concatMap(async (event) => await onAuctionDealed(event).catch((e) => logger.error(e))))
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
