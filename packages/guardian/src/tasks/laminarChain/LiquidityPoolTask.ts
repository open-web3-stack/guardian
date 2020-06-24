import Joi from '@hapi/joi';
import { Observable, of, from, combineLatest } from 'rxjs';
import { switchMap, map, flatMap, filter, concatAll } from 'rxjs/operators';
import { LaminarApi } from '@laminar/api';
import LaminarTask from './LaminarTask';
import { LiquidityPool } from '../../types';
import { isNonNull } from '../helpers';

export default class LiquidityPoolTask extends LaminarTask<LiquidityPool> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  init(params: { poolId: number | number[] | 'all'; currencyId: string | string[] }) {
    const { poolId, currencyId } = params;

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
                      };
                    })
                )
              ),
              flatMap((pool) =>
                combineLatest(
                  laminarApi.api.query.syntheticTokens.ratios(pool.currencyId).pipe(
                    map((i) => i.toJSON() as any),
                    map((ratios) => ({
                      ...pool,
                      collateralRatio: ratios.collateral,
                      syntheticIssuance: null,
                      collateralBalance: null,
                      isSafe: null,
                    }))
                  )
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
