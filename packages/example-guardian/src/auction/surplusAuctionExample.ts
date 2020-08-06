#!/usr/bin/env node

import Big from 'big.js';
import { calcTargetInBaseToOther, Fixed18 } from '@acala-network/app-util';
import { combineLatest } from 'rxjs';
import { concatMap, take, withLatestFrom, catchError } from 'rxjs/operators';

import readConst from './const';
import setupApi from './setupApi';
import setupMonitoring from './setupMonitoring';

const ONE = Big(1e18);

const run = async () => {
  const { nodeEndpoint, bidderAddress, margin, bidderSURI } = readConst('surplus-auction-guardian.yml');

  const { exchangeFee, slippage, bid, swap } = await setupApi(nodeEndpoint, bidderSURI, bidderAddress);
  const { surplusAuctionDealed$, surplusAuctions$, balance$, pool$ } = setupMonitoring();

  surplusAuctions$
    .pipe(
      concatMap(({ data: auction }) =>
        combineLatest(balance$, pool$).pipe(
          take(1),
          concatMap(async ([balance, pool]) => {
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
          })
        )
      ),
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

  surplusAuctionDealed$
    .pipe(
      withLatestFrom(pool$),
      concatMap(async ([{ data: event }, pool]) => {
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

        return await swap('AUSD', amount.innerToString(), 'ACA', target.innerToString());
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
