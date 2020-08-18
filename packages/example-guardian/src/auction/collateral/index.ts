#!/usr/bin/env node

import Big from 'big.js';
import { calcSwapTargetAmount } from '@acala-network/app-util';
import { concatMap } from 'rxjs/operators';
import { CollateralAuction, Event } from '@open-web3/guardian/types';
import config from '../config';
import setupApi from '../setupApi';
import { registerActions } from './registerActions';
import { setDefaultConfig, logger } from '../../utils';
import { calculateBid } from '../calculateBid';

const run = async () => {
  setDefaultConfig('collateral-auction-guardian.yml');

  const { nodeEndpoint, address, margin, SURI } = config();

  const { collateralAuctions$, collateralAuctionDealt$, getBalance, getPool } = registerActions();

  const { exchangeFee, slippage, bid, swap } = await setupApi(nodeEndpoint, SURI, address);

  const onAuction = async (auction: CollateralAuction) => {
    const balance = await getBalance();
    const pool = await getPool(auction.currencyId);

    const ourBid = calculateBid(auction, pool.price, balance.free, margin);

    const result = await bid(auction.auctionId, ourBid.toFixed(0));
    logger.log('Bid sent: ', JSON.stringify(result));
  };

  const onAuctionDealt = async (event: Event) => {
    const currencyId = event.args['collateral_type'] || event.args['arg2'];
    const amount = event.args['collateral_amount'] || event.args['arg3'];

    const pool = await getPool(currencyId);

    const target = Big(
      calcSwapTargetAmount(
        Number.parseInt(amount),
        Number.parseInt(pool.otherLiquidity),
        Number.parseInt(pool.baseLiquidity),
        exchangeFee,
        slippage
      )
    ).toFixed(0);

    const result = await swap(currencyId, amount, 'AUSD', target);
    logger.log('Swap sent: ', JSON.stringify(result));
  };

  collateralAuctions$
    .pipe(concatMap(async (auction) => await onAuction(auction).catch((e) => logger.error(e))))
    .subscribe();

  collateralAuctionDealt$
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
