#!/usr/bin/env node

import BN from 'big.js';
import { WsProvider } from '@polkadot/rpc-provider';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { options } from '@acala-network/api';
import { calcSwapTargetAmount, Fixed18 } from '@acala-network/app-util';
import { combineLatest } from 'rxjs';
import { concatMap, take, withLatestFrom, catchError } from 'rxjs/operators';
import { ApiManager } from '@open-web3/api';

import readConst from './const';
import setupMonitoring from './setupMonitoring';

const ONE = BN('1000000000000000000');

const run = async () => {
  const { nodeEndpoint, bidderAddress, margin, bidderSURI } = readConst();

  await cryptoWaitReady();

  const ws = new WsProvider(nodeEndpoint);
  const apiManager = await ApiManager.create(options({ provider: ws }));

  // setup keyring
  const keyring = new Keyring({ type: 'sr25519' });
  keyring.addFromUri(bidderSURI);

  const exchangeFee = Fixed18.fromParts(apiManager.api.consts.dex.getExchangeFee.toString());
  const slippage = Fixed18.fromRational(5, 1000); // 0.5% price slippage

  const { events$, collateralAuctions$, balance$, pool$ } = setupMonitoring();

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
            if (BN(balance.free).lt(maxBid.mul(auction.amount))) {
              console.error('not enough free balance');
              return null;
            }

            const tx = apiManager.api.tx.auction.bid(auction.auctionId, maxBid.toFixed());
            const hash = await apiManager.signAndSend(tx, { account: keyring.getPair(bidderAddress) }).send;

            return hash;
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

  // CollateralAuctionDealed events
  events$
    .pipe(
      withLatestFrom(pool$),
      concatMap(async ([event, pool]) => {
        const [, currencyId, amount] = event.args;

        const target = BN(
          calcSwapTargetAmount(
            Number.parseInt(amount),
            Number.parseInt(pool.otherLiquidity),
            Number.parseInt(pool.baseLiquidity),
            exchangeFee,
            slippage
          )
        ).toFixed();

        const tx = apiManager.api.tx.dex.swapCurrency(currencyId, amount, 'AUSD', target);
        const hash = await apiManager.signAndSend(tx, { account: keyring.getPair(bidderAddress) }).send;

        return hash;
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
