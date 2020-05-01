import { Observable } from 'rxjs';
import { LaminarApi } from '@laminar/api';
import createLaminarApi from './createLaminarApi';
import EventsTask from '../shared/EventsTask';
import LiquidityPoolTask from './LiquidityPoolTask';
import BalancesTask from './BalancesTask';
import TraderInfoTask from './TraderInfoTask';
import PositionsByTraderTask from './PositionsByTraderTask';
import PoolInfoTask from './PoolInfoTask';

export default (api$: Observable<LaminarApi>) => ({
  system: {
    events: new EventsTask(api$),
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
});

export { createLaminarApi };
