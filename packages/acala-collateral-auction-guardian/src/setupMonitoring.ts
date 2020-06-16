import { ReplaySubject } from 'rxjs';
import { CollateralAuction, Balance, Event, Pool } from '@open-web3/guardian/types';
import registerAction from './registerAction';

export { CollateralAuction, Balance, Event };

const setupMonitoring = () => {
  const events$ = new ReplaySubject<Event>();
  const collateralAuctions$ = new ReplaySubject<CollateralAuction>();
  const balance$ = new ReplaySubject<Balance>();
  const pool$ = new ReplaySubject<Pool>();

  registerAction('internal-events', events$);
  registerAction('internal-collateralAuctions', collateralAuctions$);
  registerAction('internal-balance', balance$);
  registerAction('internal-pool', pool$);

  return {
    events$,
    collateralAuctions$,
    balance$,
    pool$,
  };
};

export default setupMonitoring;
