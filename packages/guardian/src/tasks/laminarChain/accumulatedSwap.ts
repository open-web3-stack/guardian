import Big from 'big.js';
import { StorageType } from '@laminar/types';
import { MarginPosition } from '@laminar/types/interfaces';
import { computedFn } from 'mobx-utils';

export default (storage: StorageType) =>
  computedFn(
    (position: MarginPosition) => {
      const { poolId, pair, leverage, openAccumulatedSwapRate } = position;
      const accumulatedSwapRates = storage.marginLiquidityPools.accumulatedSwapRates(poolId, pair.toHex());
      if (!accumulatedSwapRates) return null;
      const { long, short } = accumulatedSwapRates;
      const currentSwap = leverage.toString().startsWith('Long') ? Big(long.toString()) : Big(short.toString());
      const swap = currentSwap.sub(Big(openAccumulatedSwapRate.toString()));
      return swap.lt(0) ? Big(0) : swap;
    },
    { keepAlive: true }
  );
