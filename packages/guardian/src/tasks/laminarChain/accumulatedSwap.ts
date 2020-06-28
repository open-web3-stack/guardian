import Big from 'big.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MarginPosition, LaminarApi } from '@laminar/api';
import { SwapRate } from '@laminar/types/interfaces';

export default (api: LaminarApi) => (position: MarginPosition): Observable<Big> => {
  const { poolId, pair, leverage, openAccumulatedSwapRate } = position;

  const source$ = api.api.query.marginLiquidityPools.accumulatedSwapRates(poolId, pair) as Observable<SwapRate>;

  return source$.pipe(
    map(({ long, short }) => (leverage.startsWith('Long') ? Big(long.toString()) : Big(short.toString()))),
    map((swap) => swap.sub(openAccumulatedSwapRate)),
    map((swap) => (swap.lt(0) ? Big(0) : swap))
  );
};
