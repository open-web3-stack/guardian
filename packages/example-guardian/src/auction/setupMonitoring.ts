import { filter } from 'rxjs/operators';
import { CollateralAuction, DebitAuction, SurplusAuction, Balance, Event, Pool } from '@open-web3/guardian/types';
import registerAction from '../registerAction';

export { CollateralAuction, Balance, Event };

const setupMonitoring = () => {
  const collateralAuctions$ = registerAction<CollateralAuction>('internal-collateral-auctions');
  const collateralAuctionDealed$ = registerAction<Event>('internal-collateral-auction-dealed');

  const debitAuctions$ = registerAction<DebitAuction>('internal-debit-auctions');
  const debitAuctionDealed$ = registerAction<Event>('internal-debit-auction-dealed');

  const surplusAuctions$ = registerAction<SurplusAuction>('internal-surplus-auctions');
  const surplusAuctionDealed$ = registerAction<Event>('internal-surplus-auction-dealed');

  const balance$ = registerAction<Balance>('internal-balance');
  const pool$ = registerAction<Pool>('internal-pool');

  return {
    collateralAuctionDealed$,
    debitAuctionDealed$,
    surplusAuctionDealed$,
    collateralAuctions$,
    debitAuctions$,
    surplusAuctions$,
    balance$,
    pool$: pool$.pipe(filter(({ data }) => data.price > '0')),
  };
};

export default setupMonitoring;
