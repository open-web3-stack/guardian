import { ApiRx } from '@polkadot/api';
import { Observable } from 'rxjs';

import createAcalaApi from './createAcalaApi';
import substrate from '../substrate';
import BalancesTask from '../orml/BalancesTask';
import PricesTask from '../orml/PricesTask';
import LoansTask from './LoansTask';
import CollateralAuctionsTask from './CollateralAuctionsTask';
import DebitAuctionsTask from './DebitAuctionsTask';
import SurplusAuctionsTask from './SurplusAuctionsTask';
import PoolsTask from './PoolsTask';
import InterestsTask from './InterestsTask';

export { createAcalaApi };

export default (api$: Observable<ApiRx>) => ({
  ...substrate(api$),
  account: {
    balances: new BalancesTask(api$),
  },
  oracle: {
    prices: new PricesTask(api$),
  },
  honzon: {
    loans: new LoansTask(api$),
    collateralAuctions: new CollateralAuctionsTask(api$),
    debitAuctions: new DebitAuctionsTask(api$),
    surplusAuctions: new SurplusAuctionsTask(api$),
  },
  dex: {
    pools: new PoolsTask(api$),
    interests: new InterestsTask(api$),
  },
});
