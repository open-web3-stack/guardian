#!/usr/bin/env node

import BN from 'big.js';
import { calcSwapTargetAmount } from '@acala-network/app-util';
import { combineLatest } from 'rxjs';
import { concatMap, take, withLatestFrom, catchError } from 'rxjs/operators';

import readConst from './const';
import setupApi from './setupApi';
import setupMonitoring from './setupMonitoring';

const ONE = BN('1000000000000000000');

const run = async () => {
  const { nodeEndpoint, bidderAddress, margin, bidderSURI } = readConst('collateral-auction-guardian.yml');

  const { exchangeFee, slippage, bid, swap } = await setupApi(nodeEndpoint, bidderSURI, bidderAddress);

  const { collateralAuctionDealed$, collateralAuctions$, balance$, pool$ } = setupMonitoring();

  collateralAuctions$
    .pipe(
      concatMap((auction) =>
        combineLatest(balance$, pool$).pipe(
          take(1),
          concatMap(async ([balance, pool]) => {
            const maxBid = ONE.sub(ONE.mul(BN(margin)))
              .mul(BN(pool.price))
              .div(ONE);

            if (auction.lastBid && BN(auction.lastBid).gte(maxBid)) {
              console.error('last bid is bigger than our max bid');
              return null;
            }

            // simple check for enough free balance
            if (BN(balance.free).lt(maxBid.mul(BN(auction.amount)).div(ONE))) {
              console.error('not enough free balance');
              return null;
            }

            return await bid(auction.auctionId, maxBid.toFixed(0));
          })
        )
      ),
      catchError((error) => {
        throw error;
      })
    )
    .subscribe(
      (hash) => {
        if (hash) {
          console.log('Bid sent', `Hash: ${hash.toString()}`);
        }
      },
      (error) => console.error(error)
    );

  collateralAuctionDealed$
    .pipe(
      withLatestFrom(pool$),
      concatMap(async ([event, pool]) => {
        const currencyId = event.args['collateral_type'] || event.args['arg2'];
        const amount = event.args['collateral_amount'] || event.args['arg3'];

        const target = BN(
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
