#!/usr/bin/env node

import { concatMap } from 'rxjs/operators';
import { calcSwapTargetAmount, Fixed18 } from '@acala-network/app-util';
import { DebitAuction, Event } from '@open-web3/guardian/types';
import config from '../config';
import setupApi from '../setupApi';
import { registerActions } from './registerActions';
import { setDefaultConfig, logger } from '../../utils';
import { calculateBid } from '../calculateBid';

const run = async () => {
  setDefaultConfig('debit-auction-guardian.yml');

  const { nodeEndpoint, address, margin, SURI } = config();

  const { debitAuctionDealed$, debitAuctions$, getBalance, getPool } = registerActions();

  const { exchangeFee, slippage, bid, swap } = await setupApi(nodeEndpoint, SURI, address);

  const onAuction = async (auction: DebitAuction) => {
    const balance = await getBalance();
    const pool = await getPool();

    const ourBid = calculateBid(auction, pool.price, balance.free, margin);

    const result = await bid(auction.auctionId, ourBid.toFixed(0));
    logger.log('Bid sent: ', JSON.stringify(result));
  };

  const onAuctionDealed = async (event: Event) => {
    const pool = await getPool();
    const amountHex = event.args['debit_currency_amount'] || event.args['arg2'];

    const amount = Fixed18.fromParts(Number(amountHex)).innerToNumber();

    const target = String(
      calcSwapTargetAmount(
        amount,
        Number.parseInt(pool.otherLiquidity),
        Number.parseInt(pool.baseLiquidity),
        exchangeFee,
        slippage
      )
    );

    const result = await swap('ACA', String(amount), 'AUSD', target);

    logger.log('Swap sent: ', JSON.stringify(result));
  };

  debitAuctions$.pipe(concatMap(async (auction) => await onAuction(auction).catch((e) => logger.error(e)))).subscribe();

  debitAuctionDealed$
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
