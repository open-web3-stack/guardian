#!/usr/bin/env node

import Big from 'big.js';
import { calcTargetInBaseToOther, Fixed18 } from '@acala-network/app-util';
import { concatMap } from 'rxjs/operators';
import { SurplusAuction, Event } from '@open-web3/guardian/types';
import { logger } from '@polkadot/util';
import readConst from '../const';
import setupApi from '../setupApi';
import { registerActions } from './registerActions';
import { dollar } from '../../utils';

const l = logger('surplus-auction-guardian');

const run = async () => {
  const { nodeEndpoint, address, margin, SURI } = readConst('surplus-auction-guardian.yml');
  const { exchangeFee, slippage, bid, swap } = await setupApi(nodeEndpoint, SURI, address);
  const { surplusAuctionDealed$, surplusAuctions$, getBalance, getPool } = registerActions();

  const onAuction = async (auction: SurplusAuction) => {
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
    l.log('Swap sent: ', result.toString());
  };

  surplusAuctions$.pipe(concatMap(async (auction) => await onAuction(auction).catch(l.error))).subscribe();

  surplusAuctionDealed$.pipe(concatMap(async (event) => await onAuctionDealed(event).catch(l.error))).subscribe();

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
