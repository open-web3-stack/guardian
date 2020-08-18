import { Subject, ReplaySubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { ActionRegistry } from '@open-web3/guardian';
import { Pool, Balance, CollateralAuction, Event } from '@open-web3/guardian/types';

export const registerActions = () => {
  const collateralAuctions$ = new Subject<CollateralAuction>();
  ActionRegistry.register('internal-collateral-auctions', (args: any, data: CollateralAuction) => {
    collateralAuctions$.next(data);
  });

  const collateralAuctionDealt$ = new Subject<Event>();
  ActionRegistry.register('internal-collateral-auction-dealt', (args: any, data: Event) => {
    collateralAuctionDealt$.next(data);
  });

  const balance$ = new ReplaySubject<Balance>(1);
  ActionRegistry.register('internal-balance', (args: any, data: Balance) => {
    balance$.next(data);
  });

  const pool$ = new ReplaySubject<Pool>();
  ActionRegistry.register('internal-pool', (args: any, data: Pool) => {
    pool$.next(data);
  });

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

  return { collateralAuctionDealt$, collateralAuctions$, getBalance, getPool };
};
