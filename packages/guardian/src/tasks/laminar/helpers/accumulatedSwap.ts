import Big from 'big.js';
import { map, share } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';
import { MarginPosition } from '@laminar/types/interfaces';

export default (apiRx: ApiRx) => (position: MarginPosition) => {
  const { poolId, pair, leverage, openAccumulatedSwapRate } = position;
  return apiRx.query.marginLiquidityPools.accumulatedSwapRates(poolId, pair).pipe(
    map((accumulatedSwapRates) => {
      const { long, short } = accumulatedSwapRates;
      const currentSwap = leverage.toString().startsWith('Long') ? Big(long.toString()) : Big(short.toString());
      const swap = currentSwap.sub(Big(openAccumulatedSwapRate.toString()));
      return swap.lt(0) ? Big(0) : swap;
    }),
    share()
  );
};
