#!/usr/bin/env node

import Big from 'big.js';
import { calcSwapTargetAmount } from '@acala-network/app-util';
import { ReplaySubject, Observable } from 'rxjs';
import { concatMap, take, catchError } from 'rxjs/operators';
import { Pool } from '@open-web3/guardian/types';
import readConst from './const';
import setupApi from './setupApi';
import setupMonitoring from './setupMonitoring';

const ONE = Big(1e18);

const run = async () => {
  const { nodeEndpoint, bidderAddress, margin, bidderSURI } = readConst('collateral-auction-guardian.yml');

  const { exchangeFee, slippage, bid, swap } = await setupApi(nodeEndpoint, bidderSURI, bidderAddress);

  const { collateralAuctionDealed$, collateralAuctions$, balance$, pool$ } = setupMonitoring();

  const pools: Record<string, Observable<Pool>> = {};

  const getPool = (currencyId: string): Promise<Pool> => {
    if (pools[currencyId] == null) {
      const subject$ = new ReplaySubject<Pool>(1);
      pool$.subscribe((pool) => subject$.next(pool));
      pools[currencyId] = subject$.asObservable();
    }
    return pools[currencyId].pipe(take(1)).toPromise();
  };

  const getBalance = () => {
    return balance$.asObservable().pipe(take(1)).toPromise();
  };

  collateralAuctions$
    .pipe(
      concatMap(async ({ data: auction }) => {
        const balance = await getBalance();
        const pool = await getPool(auction.currencyId);

        const maxBid = ONE.sub(ONE.mul(margin)).mul(pool.price).div(ONE);

        if (auction.lastBid && Big(auction.lastBid).gte(maxBid)) {
          console.error('last bid is bigger than our max bid');
          return null;
        }

        // simple check for enough free balance
        if (Big(balance.free).lt(maxBid.mul(auction.amount).div(ONE))) {
          console.error('not enough free balance');
          return null;
        }

        return await bid(auction.auctionId, maxBid.toFixed(0));
      }),
      catchError((error) => {
        throw error;
      })
    )
    .subscribe(
      (hash) => {
        hash && console.log('Bid sent', `Hash: ${hash.toString()}`);
      },
      (error) => console.error(error)
    );

  collateralAuctionDealed$
    .pipe(
      concatMap(async ({ data: event }) => {
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

        return await swap(currencyId, amount, 'AUSD', target);
      }),
      catchError((error) => {
        throw error;
      })
    )
    .subscribe(
      (hash) => {
        console.log('Swap sent', `Hash: ${hash.toString()}`);
      },
      (error) => console.error(error)
    );

  // start guardian
  require('@open-web3/guardian-cli');
};

export default run;

// if called directly
if (require.main === module) {
  run().catch((error) => {
    console.error(error);
    process.exit(-1);
  });
}
