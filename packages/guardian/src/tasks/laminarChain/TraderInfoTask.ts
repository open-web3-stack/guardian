import Joi from '@hapi/joi';
import { of, Observable, from } from 'rxjs';
import { switchMap, flatMap, concatAll } from 'rxjs/operators';
import { TraderInfo, LaminarApi } from '@laminar/api';
import LaminarTask from './LaminarTask';

export default class TraderInfoTask extends LaminarTask<TraderInfo> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')).required(),
    }).required();
  }

  init(params: { account: string | string[]; poolId: number | number[] | 'all' }) {
    const { account, poolId } = params;

    return this.chainApi$.pipe(
      switchMap((laminarApi) =>
        TraderInfoTask.getPoolIds(laminarApi, poolId).pipe(
          flatMap((poolId) =>
            from(Array.isArray(account) ? account : [account]).pipe(
              flatMap((account) => laminarApi.margin.traderInfo(account, poolId))
            )
          )
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
