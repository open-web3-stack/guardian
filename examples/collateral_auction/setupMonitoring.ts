import { ReplaySubject } from 'rxjs';
import { Output as CollateralAuction } from '../../src/tasks/acalaChain/CollateralAuctionsTask';
import { Output as Balance } from '../../src/tasks/orml/BalancesTask';
import { Price } from '../../src/tasks/orml/PricesTask';
import { Event } from '../../src/tasks/substrate/EventsTask';
import registerAction from './registerAction';

export { CollateralAuction, Balance, Event, Price };

const setupMonitoring = () => {
  const events$ = new ReplaySubject<Event>();
  const collateralAuctions$ = new ReplaySubject<CollateralAuction>();
  const balance$ = new ReplaySubject<Balance>();
  const price$ = new ReplaySubject<Price>();

  price$.subscribe(console.log);

  registerAction('events', events$);
  registerAction('collateralAuctions', collateralAuctions$);
  registerAction('balance', balance$);
  registerAction('price', price$);

  return {
    events$,
    collateralAuctions$,
    balance$,
    price$,
  };
};

export default setupMonitoring;
