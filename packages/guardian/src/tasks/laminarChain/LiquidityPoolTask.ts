import Big from 'big.js';
import Joi from '@hapi/joi';
import { Observable, of, from, combineLatest } from 'rxjs';
import { map, flatMap, filter, concatAll } from 'rxjs/operators';
import { LaminarApi } from '@laminar/api';
import { SyntheticTokensRatio, SyntheticPosition } from '@laminar/types/interfaces';
import { LiquidityPool } from '../../types';
import { isNonNull, getOraclePrice } from '../helpers';
import Task from '../Task';
import { LaminarGuardian } from '../../guardians';

const ONE = Big(1e18);

export default class LiquidityPoolTask extends Task<
  { poolId: number | number[] | 'all'; currencyId: string | string[]; period?: number },
  LiquidityPool
> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      period: Joi.number().default(30_000),
    }).required();
  }

  async start(guardian: LaminarGuardian) {
    const { laminarApi } = await guardian.isReady();

    const { poolId, currencyId, period } = this.arguments;

    return LiquidityPoolTask.getPoolIds(laminarApi, poolId).pipe(
      flatMap((poolId) =>
        laminarApi.synthetic.poolInfo(poolId).pipe(
          filter(isNonNull),
          flatMap((pool) =>
            from(
              pool.options
                .filter((option) => {
                  if (currencyId === 'all') return true;
                  if (currencyId === 'fTokens') return option.tokenId.toLowerCase().startsWith('f');
                  if (Array.isArray(currencyId)) return currencyId.includes(option.tokenId);
                  return option.tokenId === currencyId;
                })
                .map((option) => {
                  const { tokenId: currencyId, askSpread, bidSpread, additionalCollateralRatio } = option;
                  return {
                    poolId,
                    currencyId,
                    owner: pool.owner,
                    liquidity: pool.balance,
                    askSpread,
                    bidSpread,
                    additionalCollateralRatio,
                    enabled: (option as any).syntheticEnabled,
                    collateralRatio: '0',
                    syntheticIssuance: '0',
                    collateralBalance: '0',
                    isSafe: false,
                  };
                })
            )
          ),
          map((pool) =>
            combineLatest([
              laminarApi.api.query.syntheticTokens.positions<SyntheticPosition>(pool.poolId, pool.currencyId),
              laminarApi.api.query.syntheticTokens.ratios<SyntheticTokensRatio>(pool.currencyId),
              getOraclePrice(laminarApi.api, period)(pool.currencyId),
            ]).pipe(
              map(([position, ratio, price]) => {
                // unwrap liquidation or default 0.05%
                const liquidation = ratio.liquidation.isEmpty
                  ? ONE.mul(0.05).toFixed()
                  : ratio.liquidation.unwrap().toString();

                const { synthetic, collateral } = position.toJSON() as any;
                if (synthetic === '0') return pool;

                // syntheticValue = price * synthetic / 1e18
                const syntheticValue = price.mul(Big(synthetic)).div(ONE);
                // collateralRatio = collateral / syntheticValue
                const collateralRatio = Big(collateral).div(syntheticValue);
                // safeRatio = 1 + liquidation
                const safeRatio = ONE.add(Big(liquidation)).div(ONE);
                // isSafe = collateralRatio > safeRatio
                const isSafe = collateralRatio.gt(safeRatio);

                return {
                  ...pool,
                  collateralRatio: collateralRatio.toFixed(),
                  syntheticIssuance: synthetic,
                  collateralBalance: collateral,
                  isSafe,
                };
              })
            )
          ),
          concatAll()
        )
      )
    );
  }

  private static getPoolIds = (api: LaminarApi, poolId: number | number[] | 'all'): Observable<string> => {
    if (poolId === 'all') {
      return api.synthetic.allPoolIds().pipe(concatAll());
    }

    const poolIds = typeof poolId === 'number' ? [poolId] : poolId;
    return of(...poolIds.map((i) => String(i)));
  };
}
