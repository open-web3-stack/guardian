import { ApiRx } from '@polkadot/api';
import { Observable } from 'rxjs';

import createAcalaApi from './createAcalaApi';
import substrate from '../substrate';
import BalancesTask from '../orml/BalancesTask';
import PricesTask from '../orml/PricesTask';

export { createAcalaApi };

export default (api$: Observable<ApiRx>) => ({
  ...substrate(api$),
  account: {
    balances: new BalancesTask(api$),
  },
  orml: {
    prices: new PricesTask(api$),
  },
});
