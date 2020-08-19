import Joi from 'joi';
import { of, Observable } from 'rxjs';
import { flatMap, filter, concatAll } from 'rxjs/operators';
import { MarginPoolInfo, LaminarApi } from '@laminar/api';
import { isNonNull } from '../helpers';
import Task from '../Task';
import { LaminarGuardian } from '../../guardians';

export default class PoolInfoTask extends Task<{ poolId: number | number[] | 'all' }, MarginPoolInfo> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')).required(),
    }).required();
  }

  async start(guardian: LaminarGuardian) {
    const { laminarApi } = await guardian.isReady();

    const { poolId } = this.arguments;

    return PoolInfoTask.getPoolIds(laminarApi, poolId).pipe(
      flatMap((poolId) => laminarApi.margin.poolInfo(poolId)),
      filter(isNonNull)
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
