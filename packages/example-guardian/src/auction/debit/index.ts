#!/usr/bin/env node

import Big from 'big.js';
import { concatMap } from 'rxjs/operators';
import { calcSwapTargetAmount, Fixed18 } from '@acala-network/app-util';
import { DebitAuction, Event } from '@open-web3/guardian/types';
import { logger } from '@polkadot/util';
import readConst from '../const';
import setupApi from '../setupApi';
import { registerActions } from './registerActions';
import { dollar } from '../../utils';

const l = logger('debit-auction-guardian');

const run = async () => {
  const { nodeEndpoint, address, margin, SURI } = readConst('debit-auction-guardian.yml');

  const { debitAuctionDealed$, debitAuctions$, getBalance, getPool } = registerActions();

  const { exchangeFee, slippage, bid, swap } = await setupApi(nodeEndpoint, SURI, address);

  const onAuction = async (auction: DebitAuction) => {
    const balance = await getBalance();
    const pool = await getPool();

    const maxBid = dollar(1).sub(dollar(margin)).mul(pool.price).div(dollar(1));

    if (auction.lastBid && Big(auction.lastBid).gte(maxBid)) {
      l.error('last bid is bigger than our max bid');
      return;
    }

    // simple check for enough free balance
    if (Big(balance.free).lt(maxBid.mul(auction.amount).div(dollar(1)))) {
      l.error('not enough aUSD balance to place the bid');
      return;
    }

    const result = await bid(auction.auctionId, maxBid.toFixed(0));
    l.log('Bid sent: ', result.toString());
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

    l.log('Swap sent: ', result.toString());
  };

  debitAuctions$.pipe(concatMap(async (auction) => await onAuction(auction).catch(l.error))).subscribe();

  debitAuctionDealed$.pipe(concatMap(async (event) => await onAuctionDealed(event).catch(l.error))).subscribe();

  // start guardian
  require('@open-web3/guardian-cli');
};

export default run;

// if called directly
if (require.main === module) {
  run().catch((error) => {
    l.error(error);
    process.exit(-1);
  });
}
