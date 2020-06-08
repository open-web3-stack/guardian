import BN from 'bn.js';
import { ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { options } from '@acala-network/api';
import { DerivedDexPool } from '@acala-network/api-derive/types';
import { calcSwapTargetAmount, Fixed18 } from '@acala-network/app-util';
import { Observable, never, forkJoin } from 'rxjs';
import { catchError, concatMap, map, filter, take } from 'rxjs/operators';
import setupMonitoring from './setupMonitoring';
import { nodeEndpoint, bidder_address, margin, bidder_suri } from './const';
import guardian from '../../src';
import config from './config';

const api$ = new ApiRx(options({ provider: new WsProvider(nodeEndpoint) }));

const run = async () => {
  await cryptoWaitReady();
  await api$.isReady.toPromise();

  // setup keyring
  const keyring = new Keyring({ type: 'sr25519' });
  keyring.addFromUri(bidder_suri);

  const exchangeFee = Fixed18.fromParts(api$.consts.dex.getExchangeFee.toString());
  const slippage = Fixed18.fromRational(5, 1000); // 0.5% price slippage

  const pool$: Observable<DerivedDexPool> = api$.derive['dex'].pool('XBTC');

  const { events$, collateralAuctions$, balance$, price$ } = setupMonitoring();

  balance$.subscribe(console.log);

  collateralAuctions$
    .pipe(
      concatMap((auction) =>
        forkJoin(balance$.pipe(take(1)), price$.pipe(take(1))).pipe(
          concatMap(([balance, price]) => {
            console.log(auction);
            if (auction.lastBidder && auction.lastBidder === balance.account) {
              // we're the last bidder
              return never();
            }

            const ONE = new BN('1000000000000000000');

            const m = ONE.sub(ONE.muln(Number.parseFloat(margin)));
            const maxBid = m.mul(new BN(price.value)).div(ONE);

            if (new BN(auction.lastBid).gte(maxBid)) {
              console.log('last bid is bigger than our max bid');
              return never();
            }

            console.log(`Bid auctionId: ${auction.auctionId} -> price: ${maxBid.toString()}`);

            return api$.tx.auction
              .bid(auction.auctionId, maxBid.toString())
              .signAndSend(keyring.getPair(balance.account))
              .pipe(
                filter((i) => i.isFinalized),
                catchError((error) => {
                  console.error(error);
                  return never();
                }),
                take(1)
              );
          })
        )
      )
    )
    .subscribe((result) => {
      console.log(result.status.toHuman());
    });

  // CollateralAuctionDealed events
  events$
    .pipe(
      map((event): { [key: string]: string } => {
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
      concatMap((event) =>
        pool$.pipe(
          take(1),
          concatMap((pool) => {
            const { winner, collateralAmount: amount, collateralType: currencyId } = event;

            const target = calcSwapTargetAmount(
              Number.parseInt(amount),
              Number.parseInt(pool.other.toString()),
              Number.parseInt(pool.base.toString()),
              exchangeFee,
              slippage
            ).toString();

            console.log(`Swap ${amount} ${currencyId} for ${target} AUSD`);

            return api$.tx.dex
              .swapCurrency(currencyId as any, new BN(amount), 'AUSD', new BN(target))
              .signAndSend(keyring.getPair(winner))
              .pipe(
                filter((i) => i.isFinalized),
                catchError((error) => {
                  console.error(error);
                  return never();
                }),
                take(1)
              );
          })
        )
      )
    )
    .subscribe((result) => {
      console.log(result.status.toHuman());
    });

  // start guardian
  guardian(config);
};

export default run;

// if called directly
if (require.main === module) {
  run();
}
