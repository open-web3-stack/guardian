import { ReplaySubject } from 'rxjs';
import { CollateralAuction, Balance, Price, Event } from '@open-web3/guardian/types';
import registerAction from './registerAction';

export { CollateralAuction, Balance, Event, Price };

const setupMonitoring = () => {
  const events$ = new ReplaySubject<Event>();
  const collateralAuctions$ = new ReplaySubject<CollateralAuction>();
  const balance$ = new ReplaySubject<Balance>();
  const price$ = new ReplaySubject<Price>();

  registerAction('internal-events', events$);
  registerAction('internal-collateralAuctions', collateralAuctions$);
  registerAction('internal-balance', balance$);
  registerAction('internal-price', price$);

  return {
    events$,
    collateralAuctions$,
    balance$,
    price$,
  };
};

export default setupMonitoring;
