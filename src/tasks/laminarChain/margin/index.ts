import PoolInfoTask from './PoolInfoTask';
import TraderInfoTask from './TraderInfoTask';
import PositionsByTraderTask from './PositionsByTraderTask';

export default {
  poolInfo: new PoolInfoTask(),
  traderInfo: new TraderInfoTask(),
  positionsByTrader: new PositionsByTraderTask(),
};
