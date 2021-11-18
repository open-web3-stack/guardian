import Big from 'big.js';
import Joi from 'joi';
import { castArray } from 'lodash';
import { of, combineLatest, range } from 'rxjs';
import { map, mergeMap, filter, switchMap, pairwise, distinctUntilChanged, concatWith } from 'rxjs/operators';
import {
  SyntheticPoolCurrencyOption,
  SyntheticPosition,
  SyntheticTokensRatio,
  CurrencyId
} from '@laminar/types/interfaces';
import { ApiRx } from '@polkadot/api';
import { Permill } from '@polkadot/types/interfaces';
import { LaminarGuardian } from '@open-web3/guardian/guardians';
import { toBaseUnit as dollar } from '@open-web3/util';
import { LiquidityPool } from '../../types';
import getOraclePrice from './helpers/getOraclePrice';
import Task from '../Task';

const getSyntheticPools = (apiRx: ApiRx) => (poolId: number | number[] | 'all') => {
  const upcomingPools$ = apiRx.query.baseLiquidityPoolsForSynthetic.nextPoolId().pipe(
    pairwise(),
    filter(([, next]) => !next.isZero()),
    switchMap(([prev, next]) => range(prev.toNumber(), next.toNumber())),
    distinctUntilChanged(),
    mergeMap((poolId) =>
      combineLatest([
        of(poolId.toString()),
        apiRx.query.baseLiquidityPoolsForSynthetic.pools(poolId).pipe(
          filter((x) => x.isSome),
          map((x) => x.unwrap())
        )
      ])
    )
  );

  if (poolId === 'all') {
    return apiRx.query.baseLiquidityPoolsForSynthetic.pools.entries().pipe(
      mergeMap((x) => x),
      filter(([, value]) => value.isSome),
      mergeMap(
        ([
          {
            args: [poolId]
          },
          pool
        ]) => combineLatest([of(poolId.toString()), of(pool.unwrap())])
      ),
      concatWith(upcomingPools$)
    );
  } else {
    return of(castArray(poolId)).pipe(
      mergeMap((x) => x),
      switchMap((poolId) =>
        combineLatest([of(poolId.toString()), apiRx.query.baseLiquidityPoolsForSynthetic.pools(poolId)])
      ),
      filter(([, pool]) => pool.isSome),
      mergeMap(([poolId, value]) => combineLatest([of(poolId), of(value.unwrap())]))
    );
  }
};

const getPoolCurrencyOptions =
  (apiRx: ApiRx, tokens: Record<string, number>) =>
  (poolId: string, currencyId: string | string[] | 'fTokens' | 'all') => {
    let currencyIds: string[] = [];
    switch (currencyId) {
      case 'all':
        currencyIds = Object.keys(tokens);
        break;
      case 'fTokens':
        currencyIds = Object.keys(tokens).filter((key) => key.startsWith('f'));
        break;
      default:
        currencyIds = typeof currencyId === 'string' ? [currencyId] : currencyId;
        break;
    }
    return of(currencyIds).pipe(
      mergeMap((x) => x),
      mergeMap((currency) =>
        combineLatest([of(currency), apiRx.query.syntheticLiquidityPools.poolCurrencyOptions(poolId, currency)])
      )
    );
  };

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
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required()
    }).required();
  }

  async start(guardian: LaminarGuardian) {
    const { apiRx, tokens } = await guardian.isReady();

    const { poolId, currencyId } = this.arguments;

    const oraclePrice = getOraclePrice(apiRx);
    const getPools = getSyntheticPools(apiRx);
    const getOptions = getPoolCurrencyOptions(apiRx, tokens);

    return getPools(poolId).pipe(
      mergeMap(([poolId, pool]) => {
        return getOptions(poolId, currencyId).pipe(
          mergeMap(([currency, option]) =>
            combineLatest([
              apiRx.query.syntheticTokens.positions(poolId, currency).pipe(
                filter((position) => {
                  return !(position as SyntheticPosition).synthetic.isZero();
                })
              ),
              apiRx.query.syntheticTokens.ratios(currency),
              oraclePrice(apiRx.createType<CurrencyId>('CurrencyId', currency))
            ]).pipe(
              map(([position, ratio, price]) => {
                const { askSpread, bidSpread, additionalCollateralRatio, syntheticEnabled } =
                  option as SyntheticPoolCurrencyOption;

                // unwrap liquidation or default 0.05%
                const liquidation = (ratio as SyntheticTokensRatio).liquidation.isSome
                  ? toFixed128((ratio as SyntheticTokensRatio).liquidation.unwrap())
                  : dollar(0.05);

                const synthetic = (position as SyntheticPosition).synthetic.toString();
                const collateral = (position as SyntheticPosition).collateral.toString();

                // syntheticValue = price * synthetic / 1e18
                const syntheticValue = Big(price).mul(synthetic).div(dollar(1));
                // collateralRatio = collateral / syntheticValue
                const collateralRatio = Big(collateral).div(syntheticValue);
                // safeRatio = 1 + liquidation
                const safeRatio = dollar(1).add(liquidation).div(dollar(1));
                // isSafe = collateralRatio > safeRatio
                const isSafe = collateralRatio.gt(safeRatio);

                return {
                  poolId,
                  currencyId: currency,
                  owner: pool.owner.toString(),
                  liquidity: pool.balance.toString(),
                  askSpread: askSpread.isSome ? askSpread.toString() : undefined,
                  bidSpread: bidSpread.isSome ? bidSpread.toString() : undefined,
                  additionalCollateralRatio: additionalCollateralRatio.isSome
                    ? additionalCollateralRatio.toString()
                    : undefined,
                  enabled: syntheticEnabled.toJSON(),
                  collateralRatio: collateralRatio.toFixed(),
                  syntheticIssuance: synthetic,
                  collateralBalance: collateral,
                  isSafe
                };
              })
            )
          )
        );
      })
    );
  }
}
