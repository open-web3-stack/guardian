import BN from 'big.js';
import Joi from '@hapi/joi';
import { Observable, of, from, combineLatest } from 'rxjs';
import { switchMap, map, flatMap, filter, concatAll } from 'rxjs/operators';
import { LaminarApi } from '@laminar/api';
import { SyntheticTokensRatio, SyntheticPosition } from '@laminar/types/interfaces';
import { TimestampedValue } from '@open-web3/orml-types/interfaces';
import { Option } from '@polkadot/types/codec';
import LaminarTask from './LaminarTask';
import { LiquidityPool } from '../../types';
import { isNonNull, getValueFromTimestampValue, observeRPC } from '../helpers';

const ONE = BN(1e18);
export default class LiquidityPoolTask extends LaminarTask<LiquidityPool> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      period: Joi.number().default(30_000),
    }).required();
  }

  init(params: { poolId: number | number[] | 'all'; currencyId: string | string[]; period: number }) {
    const { poolId, currencyId, period } = params;

    return this.chainApi$.pipe(
      switchMap((laminarApi) =>
        LiquidityPoolTask.getPoolIds(laminarApi, poolId).pipe(
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
                  laminarApi.api.query.syntheticTokens.positions(pool.poolId, pool.currencyId) as Observable<
                    SyntheticPosition
                  >,
                  laminarApi.api.query.syntheticTokens.ratios(pool.currencyId) as Observable<SyntheticTokensRatio>,
                  observeRPC<Option<TimestampedValue>>(
                    laminarApi.api.rpc['oracle'].getValue,
                    [pool.currencyId],
                    period
                  ),
                ]).pipe(
                  map(([position, ratio, timestampedValue]) => {
                    // unwrap liquidation or default 0.05%
                    const liquidation = ratio.liquidation.isEmpty
                      ? ONE.mul(0.05).toFixed()
                      : ratio.liquidation.unwrap().toString();

                    if (timestampedValue.isEmpty) return pool;
                    const price = getValueFromTimestampValue(timestampedValue.unwrap()).toString();

                    const { synthetic, collateral } = position.toJSON() as any;
                    if (synthetic === '0') return pool;

                    // syntheticValue = price * synthetic / 1e18
                    const syntheticValue = BN(price).mul(BN(synthetic)).div(ONE);
                    // collateralRatio = collateral / syntheticValue
                    const collateralRatio = BN(collateral).div(syntheticValue);
                    // safeRatio = 1 + liquidation
                    const safeRatio = ONE.add(BN(liquidation)).div(ONE);
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
