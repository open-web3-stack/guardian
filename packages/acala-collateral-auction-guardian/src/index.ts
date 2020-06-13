import BN from 'big.js';
import path from 'path';
import { WsProvider } from '@polkadot/rpc-provider';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { options } from '@acala-network/api';
import { DerivedDexPool } from '@acala-network/api-derive/types';
import { calcSwapTargetAmount, Fixed18 } from '@acala-network/app-util';
import { ReplaySubject, combineLatest } from 'rxjs';
import { map, filter, concatMap, take, withLatestFrom, catchError } from 'rxjs/operators';
import { ApiManager } from '@open-web3/api';
import guardian, { readConfig } from '@open-web3/guardian';

import { nodeEndpoint, bidder_address, margin, bidder_suri } from './const';
import setupMonitoring from './setupMonitoring';

const run = async () => {
  await cryptoWaitReady();

  const ws = new WsProvider(nodeEndpoint);
  const apiManager = await ApiManager.create(options({ provider: ws }));

  // setup keyring
  const keyring = new Keyring({ type: 'sr25519' });
  keyring.addFromUri(bidder_suri!);

  const exchangeFee = Fixed18.fromParts(apiManager.api.consts.dex.getExchangeFee.toString());
  const slippage = Fixed18.fromRational(5, 1000); // 0.5% price slippage

  const pool$ = new ReplaySubject<DerivedDexPool>();
  apiManager.api.derive['dex'].pool('XBTC', (pool: DerivedDexPool) => {
    pool$.next(pool);
  });

  const { events$, collateralAuctions$, balance$, price$ } = setupMonitoring();

  collateralAuctions$
    .pipe(
      concatMap((auction) =>
        combineLatest(balance$, price$).pipe(
          take(1),
          concatMap(async ([balance, price]) => {
            console.log(auction, balance, price);
            if (auction.lastBidder && auction.lastBidder === balance.account) {
              // we're the last bidder
              return null;
            }

            const ONE = new BN('1000000000000000000');

            const m = ONE.sub(ONE.mul(new BN(margin!)));
            const maxBid = m.mul(new BN(price.value)).div(ONE);

            if (auction.lastBid && new BN(auction.lastBid).gte(maxBid)) {
              console.log('last bid is bigger than our max bid');
              return null;
            }

            console.log(`Bid auctionId: ${auction.auctionId} -> price: ${maxBid.toFixed()}`);

            const result = await apiManager.signAndSend(
              apiManager.api.tx.auction.bid(auction.auctionId, maxBid.toFixed()),
              {
                account: keyring.getPair(balance.account),
              }
            ).inBlock;

            return result.blockHash;
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
          console.log('Bid successful', `BlockHash: ${hash.toString()}`);
        }
      },
      (error) => console.error(error)
    );

  // CollateralAuctionDealed events
  events$
    .pipe(
      map((event): { [key: string]: string } => {
        console.log(event.args);
        const [auctionId, collateralType, collateralAmount, winner, paymentAmount] = event.args;
        return {
          auctionId: auctionId.toString(),
          collateralType: collateralType.toString(),
          collateralAmount: collateralAmount.toString(),
          winner: winner.toString(),
          paymentAmount: paymentAmount.toString(),
        };
      }),
      // make sure we're the winner
      filter((event) => event.winner === bidder_address),
      withLatestFrom(pool$),
      concatMap(async ([event, pool]) => {
        console.log(event, pool);
        const { winner, collateralAmount: amount, collateralType: currencyId } = event;

        const target = BN(
          calcSwapTargetAmount(
            Number.parseInt(amount),
            Number.parseInt(pool.other.toString()),
            Number.parseInt(pool.base.toString()),
            exchangeFee,
            slippage
          )
        ).toFixed();

        console.log(`Swap ${amount} ${currencyId} for ${target} AUSD`);

        const result = await apiManager.signAndSend(
          apiManager.api.tx.dex.swapCurrency(currencyId as any, amount, 'AUSD', target),
          { account: keyring.getPair(winner) }
        ).inBlock;

        return result.blockHash;
      }),
      catchError((error) => {
        throw error;
      })
    )
    .subscribe(
      (hash) => {
        console.log('Swap successful', `BlockHash: ${hash.toString()}`);
      },
      (error) => console.error(error)
    );

  const config = readConfig(path.resolve(__dirname, 'config.yml'));

  // start guardian
  return guardian(config);
};

export default run;

// if called directly
if (require.main === module) {
  run().catch((error) => {
    console.error(error);
    process.exit(-1);
  });
}
