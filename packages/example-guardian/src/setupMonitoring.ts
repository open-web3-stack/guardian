import { ReplaySubject } from 'rxjs';
import { CollateralAuction, DebitAuction, SurplusAuction, Balance, Event, Pool } from '@open-web3/guardian/types';
import registerAction from './registerAction';

export { CollateralAuction, Balance, Event };

const setupMonitoring = () => {
  const collateralAuctions$ = new ReplaySubject<CollateralAuction>();
  const collateralAuctionDealed$ = new ReplaySubject<Event>();

  const debitAuctions$ = new ReplaySubject<DebitAuction>();
  const debitAuctionDealed$ = new ReplaySubject<Event>();

  const surplusAuctions$ = new ReplaySubject<SurplusAuction>();
  const surplusAuctionDealed$ = new ReplaySubject<Event>();

  const balance$ = new ReplaySubject<Balance>();
  const pool$ = new ReplaySubject<Pool>();

  registerAction('internal-collateral-auctions', collateralAuctions$);
  registerAction('internal-collateral-auction-dealed', collateralAuctionDealed$);

  registerAction('internal-debit-auctions', debitAuctions$);
  registerAction('internal-debit-auction-dealed', debitAuctionDealed$);

  registerAction('internal-surplus-auctions', surplusAuctions$);
  registerAction('internal-surplus-auction-dealed', surplusAuctionDealed$);

  registerAction('internal-balance', balance$);
  registerAction('internal-pool', pool$);

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
