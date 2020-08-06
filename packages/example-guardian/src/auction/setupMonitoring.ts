import { ReplaySubject } from 'rxjs';
import { ActionRegistry } from '@open-web3/guardian';
import { CollateralAuction, DebitAuction, SurplusAuction, Balance, Event, Pool } from '@open-web3/guardian/types';
import registerAction from '../registerAction';

const setupMonitoring = () => {
  const collateralAuctions$ = registerAction<CollateralAuction>('internal-collateral-auctions');
  const collateralAuctionDealed$ = registerAction<Event>('internal-collateral-auction-dealed');

  const debitAuctions$ = registerAction<DebitAuction>('internal-debit-auctions');
  const debitAuctionDealed$ = registerAction<Event>('internal-debit-auction-dealed');

  const surplusAuctions$ = registerAction<SurplusAuction>('internal-surplus-auctions');
  const surplusAuctionDealed$ = registerAction<Event>('internal-surplus-auction-dealed');

  const balance$ = new ReplaySubject<Balance>(1);
  ActionRegistry.register('internal-balance', (args: any, data: any) => {
    balance$.next(data);
  });

  const pool$ = new ReplaySubject<Pool>();
  ActionRegistry.register('internal-pool', (args: any, data: any) => {
    pool$.next(data);
  });

  return {
    collateralAuctionDealed$,
    debitAuctionDealed$,
    surplusAuctionDealed$,
    collateralAuctions$,
    debitAuctions$,
    surplusAuctions$,
    balance$,
    pool$,
  };
};

export default setupMonitoring;
