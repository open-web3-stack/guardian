import { castArray } from 'lodash';
import Joi from 'joi';
import BN from 'bn.js';
import { timer, combineLatest, shareReplay, Observable } from 'rxjs';
import { switchMap, distinctUntilChanged, filter, combineLatestAll, map, mergeMap } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';
import { Option } from '@polkadot/types';
import { MarginPoolInfo, TraderPairOptions } from '@laminar/api';
import {
  Pool,
  LiquidityPoolId,
  TradingPair,
  MarginPoolTradingPairOption,
  MarginTradingPairOption,
  MarginPoolOption,
  Balance,
  FixedU128,
  MarginPoolState
} from '@laminar/types/interfaces';
import { Task } from '@open-web3/guardian';
import { RPCRefreshPeriod } from '../constants';
import LaminarGuardian from '../LaminarGuardian';

const setup = async (apiRx: ApiRx, tokens: string[]) => {
  const getPools = (poolId: number | number[] | 'all') => {
    return apiRx.query.baseLiquidityPoolsForMargin.pools.entries<Option<Pool>>().pipe(
      mergeMap((entries) => {
        return entries.filter(([storageKey]) => {
          if (poolId === 'all') return true;
          const [id] = storageKey.args as any as [LiquidityPoolId];
          return castArray(poolId).includes(id.toNumber());
        });
      })
    );
  };

  const getTradingPairOptions = (poolId: LiquidityPoolId, getPairId: Function): Observable<TraderPairOptions[]> => {
    return apiRx.query.marginLiquidityPools.poolTradingPairOptions.entries<MarginPoolTradingPairOption>(poolId).pipe(
      mergeMap((x) => x),
      map(([storageKey, options]) => {
        const [, tradingPair] = storageKey.args as [any, TradingPair];
        return apiRx.query.marginLiquidityPools.tradingPairOptions<MarginTradingPairOption>(tradingPair).pipe(
          map((tradingPairOptions) => {
            const maxSpread = tradingPairOptions.maxSpread;
            let askSpread = options.askSpread.unwrapOrDefault();
            let bidSpread = options.bidSpread.unwrapOrDefault();

            if (maxSpread.isSome) {
              askSpread = apiRx.createType('FixedU128', BN.max(maxSpread.unwrap(), askSpread)) as any as FixedU128;
              bidSpread = apiRx.createType('FixedU128', BN.max(maxSpread.unwrap(), bidSpread)) as any as FixedU128;
            }

            return {
              pair: {
                base: tradingPair.base.toString(),
                quote: tradingPair.quote.toString()
              },
              pairId: getPairId(tradingPair),
              enabledTrades: options.enabledTrades.toJSON(),
              askSpread: askSpread.toString(),
              bidSpread: bidSpread.toString()
            };
          })
        );
      }),
      combineLatestAll()
    );
  };

  const getPairId = (pair: { base: string; quote: string }): string => {
    const baseToken = tokens.find((x) => pair.base === x);
    const quoteToken = tokens.find((x) => pair.quote === x);
    return `${baseToken || pair.base}${quoteToken || pair.quote}`;
  };

  return { getPools, getTradingPairOptions, getPairId };
};

const getPoolState = (apiRx: ApiRx, poolId: LiquidityPoolId, period: number) => {
  const stream$ = timer(0, period).pipe(
    switchMap(() => (apiRx.rpc as any).margin.poolState(poolId)),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    shareReplay({ refCount: true, bufferSize: 1 })
  );
  return stream$ as Observable<MarginPoolState>;
};

export default class PoolInfoTask extends Task<{ poolId: number | number[] | 'all'; period: number }, MarginPoolInfo> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')).required(),
      period: Joi.number().default(RPCRefreshPeriod)
    }).required();
  }

  async start(guardian: LaminarGuardian) {
    const { apiRx, tokens } = await guardian.isReady();
    const { getPools, getTradingPairOptions, getPairId } = await setup(apiRx, Object.keys(tokens));

    return getPools(this.arguments.poolId).pipe(
      filter(([, maybePool]) => maybePool.isSome),
      mergeMap(([storageKey, maybePool]) => {
        const [poolId] = storageKey.args as any as [LiquidityPoolId];
        const pool = maybePool.unwrapOrDefault();
        return combineLatest([
          apiRx.query.marginLiquidityPools.poolOptions<MarginPoolOption>(poolId),
          apiRx.query.marginLiquidityPools.defaultMinLeveragedAmount<Balance>(),
          getTradingPairOptions(poolId, getPairId),
          getPoolState(apiRx, poolId, this.arguments.period)
        ]).pipe(
          map(([options, defaultMinLeveragedAmount, tradingPairOptions, poolState]) => {
            const minLeveragedAmount = BN.max(options.minLeveragedAmount, defaultMinLeveragedAmount);
            return {
              poolId: poolId.toString(),
              owner: pool.owner.toString(),
              balance: pool.balance.toString(),
              enp: poolState.enp.toString(),
              ell: poolState.ell.toString(),
              options: tradingPairOptions,
              minLeveragedAmount: minLeveragedAmount.toString()
            };
          })
        );
      })
    );
  }
}
