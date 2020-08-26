import _ from 'lodash';
import Joi from 'joi';
import BN from 'bn.js';
import { MarginPoolInfo, LaminarApi, TraderPairOptions } from '@laminar/api';
import { StorageType } from '@laminar/types';
import { Pool } from '@laminar/types/interfaces';
import { autorun$ } from '@open-web3/guardian/utils';
import { LaminarGuardian } from '@open-web3/guardian/guardians';
import { computedFn } from 'mobx-utils';
import Task from '../Task';

const setup = async (laminarApi: LaminarApi, storage: StorageType) => {
  const getPools = computedFn((poolId: number | number[] | 'all') => {
    const pools: Record<string, Pool> = {};

    if (poolId === 'all') {
      const entries = storage.baseLiquidityPoolsForMargin.pools.entries();
      entries.forEach((pool, id) => {
        if (pool.isSome) {
          pools[id] = pool.unwrap();
        }
      });
    } else {
      _.castArray(poolId).forEach((id) => {
        const pool = storage.baseLiquidityPoolsForMargin.pools(id);
        if (pool?.isSome) {
          pools[id] = pool.unwrap();
        }
      });
    }

    return pools;
  });

  const getTradingPairOptions = computedFn((poolId: string, getPairId: Function) => {
    const output: TraderPairOptions[] = [];
    const poolTradingPairOptions = storage.marginLiquidityPools.poolTradingPairOptions.entries(poolId);

    if (!poolTradingPairOptions) return;

    for (const [pair, options] of poolTradingPairOptions.entries()) {
      const tradingPair = laminarApi.api.createType('TradingPair', JSON.parse(pair));
      const tradingPairOptions = storage.marginLiquidityPools.tradingPairOptions(tradingPair.toHex());
      if (!tradingPairOptions) continue;

      const pairId = getPairId(JSON.parse(pair));

      let askSpread = options.askSpread;
      let bidSpread = options.bidSpread;

      const maxSpread = tradingPairOptions.maxSpread;

      if (!maxSpread.isEmpty) {
        if (!askSpread.isEmpty && maxSpread.unwrap().lt(askSpread.unwrap())) {
          askSpread = maxSpread;
        }
        if (!bidSpread.isEmpty && maxSpread.unwrap().lt(bidSpread.unwrap())) {
          bidSpread = maxSpread;
        }
      }

      output.push({
        pair: JSON.parse(pair),
        pairId,
        enabledTrades: options.enabledTrades.toJSON(),
        askSpread: askSpread.toString(),
        bidSpread: bidSpread.toString(),
      });
    }

    return output.length > 0 ? output : undefined;
  });

  const tokens = await laminarApi.currencies.tokens().toPromise();

  const getPairId = () => {
    return (pair: { base: string; quote: string }): string => {
      const baseToken = tokens.find(({ id }) => pair.base === id);
      const quoteToken = tokens.find(({ id }) => pair.quote === id);
      return `${baseToken?.name || pair.base}${quoteToken?.name || pair.quote}`;
    };
  };

  return { getPools, getTradingPairOptions, getPairId };
};

export default class PoolInfoTask extends Task<{ poolId: number | number[] | 'all' }, MarginPoolInfo> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')).required(),
    }).required();
  }

  async start(guardian: LaminarGuardian) {
    const { laminarApi, storage } = await guardian.isReady();
    const { getPools, getTradingPairOptions, getPairId } = await setup(laminarApi, storage);

    return autorun$<MarginPoolInfo>((subscriber) => {
      const pools = getPools(this.arguments.poolId);

      for (const [poolId, pool] of Object.entries(pools)) {
        const options = storage.marginLiquidityPools.poolOptions(poolId);
        const defaultMinLeveragedAmount = storage.marginLiquidityPools.defaultMinLeveragedAmount;
        if (!options || !defaultMinLeveragedAmount) continue;

        const minLeveragedAmount = BN.max(options.minLeveragedAmount, defaultMinLeveragedAmount);

        const tradingPairOptions = getTradingPairOptions(poolId, getPairId);
        if (!tradingPairOptions) continue;

        laminarApi.api.rpc.margin
          .poolState(poolId)
          .toPromise()
          .then((poolState) => {
            subscriber.next({
              poolId,
              owner: pool.owner.toString(),
              balance: pool.balance.toString(),
              enp: poolState.enp.toString(),
              ell: poolState.ell.toString(),
              options: tradingPairOptions,
              minLeveragedAmount: minLeveragedAmount.toString(),
            });
          })
          .catch();
      }
    });
  }
}
