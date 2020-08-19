import { Subject, ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { ActionRegistry } from '@open-web3/guardian';
import { Pool, Balance, DebitAuction, Event } from '@open-web3/guardian/types';

export const registerActions = () => {
  const debitAuctions$ = new Subject<DebitAuction>();
  ActionRegistry.register('internal-debit-auctions', (args: any, data: DebitAuction) => {
    debitAuctions$.next(data);
  });

  const debitAuctionDealt$ = new Subject<Event>();
  ActionRegistry.register('internal-debit-auction-dealt', (args: any, data: Event) => {
    debitAuctionDealt$.next(data);
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

  return { debitAuctionDealt$, debitAuctions$, getBalance, getPool };
};
