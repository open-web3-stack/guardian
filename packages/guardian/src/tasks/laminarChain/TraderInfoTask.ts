import Joi from '@hapi/joi';
import { of, Observable, from } from 'rxjs';
import { flatMap, concatAll } from 'rxjs/operators';
import { TraderInfo, LaminarApi } from '@laminar/api';
import Task from '../Task';
import { LaminarGuardian } from '@open-web3/guardian/guardians';

export default class TraderInfoTask extends Task<
  { account: string | string[]; poolId: number | number[] | 'all' },
  TraderInfo
> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')).required(),
    }).required();
  }

  async start(guardian: LaminarGuardian) {
    const { laminarApi } = await guardian.isReady();

    const { account, poolId } = this.arguments;

    return TraderInfoTask.getPoolIds(laminarApi, poolId).pipe(
      flatMap((poolId) =>
        from(Array.isArray(account) ? account : [account]).pipe(
          flatMap((account) => laminarApi.margin.traderInfo(account, poolId))
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
