import { Subject, ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { ActionRegistry } from '@open-web3/guardian';
import { Pool, Balance, SurplusAuction, Event } from '@open-web3/guardian/types';

export const registerActions = () => {
  const surplusAuctions$ = new Subject<SurplusAuction>();
  ActionRegistry.register('internal-surplus-auctions', (args: any, data: SurplusAuction) => {
    surplusAuctions$.next(data);
  });

  const surplusAuctionDealt$ = new Subject<Event>();
  ActionRegistry.register('internal-surplus-auction-dealt', (args: any, data: Event) => {
    surplusAuctionDealt$.next(data);
  });

  const balance$ = new ReplaySubject<Balance>(1);
  ActionRegistry.register('internal-balance', (args: any, data: Balance) => {
    balance$.next(data);
  });

  const pool$ = new ReplaySubject<Pool>(1);
  ActionRegistry.register('internal-pool', (args: any, data: Pool) => {
    pool$.next(data);
  });

  const getPool = (): Promise<Pool> => {
    return pool$.asObservable().pipe(take(1)).toPromise();
  };

  const getBalance = () => {
    return balance$.asObservable().pipe(take(1)).toPromise();
  };

  return { surplusAuctionDealt$, surplusAuctions$, getBalance, getPool };
};
