import Joi from '@hapi/joi';
import { of, Observable } from 'rxjs';
import { switchMap, flatMap, filter, concatAll } from 'rxjs/operators';
import { MarginPoolInfo, LaminarApi } from '@laminar/api';
import LaminarTask from './LaminarTask';
import { isNonNull } from '../helpers';

export default class PoolInfoTask extends LaminarTask<MarginPoolInfo> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')).required(),
    }).required();
  }

  init(params: { poolId: number | number[] | 'all' }) {
    const { poolId } = params;

    return this.chainApi$.pipe(
      switchMap((laminarApi) =>
        PoolInfoTask.getPoolIds(laminarApi, poolId).pipe(
          flatMap((poolId) => laminarApi.margin.poolInfo(poolId)),
          filter(isNonNull)
        )
      )
    );
  }

  private static getPoolIds = (api: LaminarApi, poolId: number | number[] | 'all'): Observable<string> => {
    if (poolId === 'all') {
      return api.margin.allPoolIds().pipe(concatAll());
    }

    const poolIds = typeof poolId === 'number' ? [poolId] : poolId;
    return of(...poolIds.map((i) => String(i)));
  };
}
