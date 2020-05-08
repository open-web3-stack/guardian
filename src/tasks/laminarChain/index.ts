import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LaminarApi } from '@laminar/api';

import substrate from '../substrate';
import createLaminarApi from './createLaminarApi';
import TraderInfoTask from './TraderInfoTask';
import PositionsByTraderTask from './PositionsByTraderTask';
import PoolInfoTask from './PoolInfoTask';
import LiquidityPoolTask from './LiquidityPoolTask';
import BalancesTask from './BalancesTask';

export { createLaminarApi };

export default (api$: Observable<LaminarApi>) => ({
  ...substrate(api$.pipe(map(({ api }) => api))),
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
});
