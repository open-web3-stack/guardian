import _ from 'lodash';
import Joi from '@hapi/joi';
import { from } from 'rxjs';
import { switchMap, flatMap, map, filter } from 'rxjs/operators';
import { MarginPoolInfo } from '@laminar/api';
import LaminarTask from './LaminarTask';

export default class PoolInfoTask extends LaminarTask<MarginPoolInfo> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')),
    }).required();
  }

  init(params: { poolId: number | number[] | 'all' }) {
    const { poolId } = params;

    return this.chainApi$.pipe(
      switchMap((laminarApi) => {
        if (poolId === 'all') {
          // get all pool ids then map into pool info
          return laminarApi.margin.allPoolIds().pipe(
            flatMap((ids) => ids.map((id) => laminarApi.margin.poolInfo(id))),
            flatMap((i) => i)
          );
        } else if (_.isArray(poolId)) {
          return from(poolId).pipe(
            map((id) => `${id}`),
            flatMap((id) => laminarApi.margin.poolInfo(id))
          );
        }
        return laminarApi.margin.poolInfo(`${poolId}`);
      }),
      filter((i) => i !== null),
      map((i) => i as MarginPoolInfo)
    );
  }
}
