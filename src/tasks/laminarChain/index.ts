import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LaminarApi } from '@laminar/api';

import createLaminarApi from './createLaminarApi';

import TraderInfoTask from './TraderInfoTask';
import PositionsByTraderTask from './PositionsByTraderTask';
import PoolInfoTask from './PoolInfoTask';

import EventsTask from '../shared/EventsTask';
import StorageTask from '../shared/StorageTask';
import AccountsTask from '../shared/AccountsTask';

import LiquidityPoolTask from './LiquidityPoolTask';

import BalancesTask from './BalancesTask';

export default (api$: Observable<LaminarApi>) => {
  const apiRx$ = api$.pipe(map(({ api }) => api));
  return {
    system: {
      events: new EventsTask(apiRx$),
      storage: new StorageTask(apiRx$),
      accounts: new AccountsTask(apiRx$),
    },
    synthetic: {
      liquidityPool: new LiquidityPoolTask(api$),
    },
    margin: {
      traderInfo: new TraderInfoTask(api$),
      positionsByTrader: new PositionsByTraderTask(api$),
      poolInfo: new PoolInfoTask(api$),
    },
    account: {
      balances: new BalancesTask(api$),
    },
  };
};

export { createLaminarApi };
