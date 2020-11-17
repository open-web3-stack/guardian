import Big from 'big.js';
import Joi from 'joi';
import { Pool, SyntheticPoolCurrencyOption } from '@laminar/types/interfaces';
import { Permill } from '@polkadot/types/interfaces';
import { LaminarGuardian } from '@open-web3/guardian/guardians';
import { StorageType } from '@laminar/types';
import { computedFn } from 'mobx-utils';
import { toBaseUnit as dollar } from '@open-web3/util';
import { LiquidityPool } from '../../types';
import getOraclePrice from '../getOraclePrice';
import { autorun$ } from '../../utils';
import Task from '../Task';

const getSyntheticPools = (storage: StorageType) =>
  computedFn((poolId: number | number[] | 'all') => {
    const pools: Record<string, Pool> = {};
    if (poolId === 'all') {
      const poolEntries = storage.baseLiquidityPoolsForSynthetic.pools.entries();
      poolEntries.forEach((poolWrapped, poolId) => {
        if (poolWrapped.isSome) {
          pools[poolId] = poolWrapped.unwrap();
        }
      });
    } else {
      const poolIds = typeof poolId === 'number' ? [poolId] : poolId;
      poolIds.forEach((poolId) => {
        const pool = storage.baseLiquidityPoolsForSynthetic.pools(poolId);
        if (pool?.isSome) {
          pools[String(poolId)] = pool.unwrap();
        }
      });
    }

    return pools;
  });

const getPoolCurrencyOptions = (storage: StorageType) =>
  computedFn((poolId: string, currencyId: string | string[] | 'fTokens' | 'all') => {
    const output: Record<string, SyntheticPoolCurrencyOption> = {};

    const options = storage.syntheticLiquidityPools.poolCurrencyOptions.entries(poolId);

    if (currencyId === 'all') {
      for (const [currencyId, option] of options.entries()) {
        output[currencyId] = option;
      }
    }

    const currencyIds = typeof currencyId === 'string' ? [currencyId] : currencyId;
    for (const [currencyId, option] of options.entries()) {
      if (currencyId === 'fTokens') {
        output[currencyId] = option;
      } else if (currencyIds.includes(currencyId)) {
        output[currencyId] = option;
      }
    }
    return output;
  });

const toFixed128 = (value: Permill): Big => {
  return Big(value.toString()).mul(1e12);
};

export default class LiquidityPoolTask extends Task<
  { poolId: number | number[] | 'all'; currencyId: string | string[] },
  LiquidityPool
> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  async start(guardian: LaminarGuardian) {
    const { storage } = await guardian.isReady();

    const { poolId, currencyId } = this.arguments;

    const oraclePrice = getOraclePrice(storage.laminarOracle);
    const getPools = getSyntheticPools(storage);
    const getOptions = getPoolCurrencyOptions(storage);

    return autorun$<LiquidityPool>((subscriber) => {
      const pools = getPools(poolId);

      for (const [poolId, pool] of Object.entries(pools)) {
        const options = getOptions(poolId, currencyId);
        for (const [currencyId, option] of Object.entries(options)) {
          const { askSpread, bidSpread, additionalCollateralRatio } = option;

          const position = storage.syntheticTokens.positions(poolId, currencyId as any);
          const ratio = storage.syntheticTokens.ratios(currencyId as any);
          const price = oraclePrice(currencyId);
          if (!position || !ratio || !price) continue;

          // unwrap liquidation or default 0.05%
          const liquidation = ratio.liquidation.isSome ? toFixed128(ratio.liquidation.unwrap()) : dollar(0.05);

          const synthetic = position.synthetic.toString();
          const collateral = position.collateral.toString();
          if (synthetic === '0') continue;

          // syntheticValue = price * synthetic / 1e18
          const syntheticValue = Big(price).mul(synthetic).div(dollar(1));
          // collateralRatio = collateral / syntheticValue
          const collateralRatio = Big(collateral).div(syntheticValue);
          // safeRatio = 1 + liquidation
          const safeRatio = dollar(1).add(liquidation).div(dollar(1));
          // isSafe = collateralRatio > safeRatio
          const isSafe = collateralRatio.gt(safeRatio);

          subscriber.next({
            poolId,
            currencyId,
            owner: pool.owner.toString(),
            liquidity: pool.balance.toString(),
            askSpread: askSpread.isSome ? askSpread.toString() : null,
            bidSpread: bidSpread.isSome ? bidSpread.toString() : null,
            additionalCollateralRatio: additionalCollateralRatio.isSome ? additionalCollateralRatio.toString() : null,
            enabled: option.syntheticEnabled.toJSON(),
            collateralRatio: collateralRatio.toFixed(),
            syntheticIssuance: synthetic,
            collateralBalance: collateral,
            isSafe,
          });
        }
      }
    });
  }
}
