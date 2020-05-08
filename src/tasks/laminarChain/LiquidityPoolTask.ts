import { isArray, omit } from 'lodash';
import joi from '@hapi/joi';
import { from } from 'rxjs';
import { switchMap, flatMap, map, filter } from 'rxjs/operators';
import LaminarTask from './LaminarTask';

export default class LiquidityPoolTask extends LaminarTask {
  validationSchema = joi
    .object({
      poolId: joi.alt(joi.number(), joi.array().items(joi.number()), joi.valid('all')),
      currencyId: joi.alt(joi.valid('all', 'fTokens'), joi.string(), joi.array().items(joi.string())),
    })
    .required();

  call(params: { poolId: number | number[] | 'all'; currencyId: string | string[] | 'all' | 'fTokens' }) {
    const { poolId, currencyId } = this.validateParameters(params);

    return this.chainApi$.pipe(
      switchMap((laminarApi) => {
        if (poolId === 'all') {
          return laminarApi.synthetic.allPoolIds().pipe(
            flatMap((ids: string[]) => ids.map((id) => laminarApi.synthetic.poolInfo(id))),
            flatMap((results) => results)
          );
        } else if (isArray(poolId)) {
          return from(poolId).pipe(flatMap((id) => laminarApi.synthetic.poolInfo(`${id}`)));
        }
        return laminarApi.synthetic.poolInfo(`${poolId}`);
      }),
      flatMap((info) => from(info.options).pipe(map((option) => ({ ...omit(info, ['options']), ...option })))),
      filter((info) => {
        if (currencyId === 'all') {
          return true;
        } else if (currencyId === 'fTokens') {
          return info.tokenId.toLowerCase().startsWith('f');
        } else if (isArray(currencyId)) {
          return currencyId.includes(info.tokenId);
        }
        return info.tokenId === currencyId;
      })
    );
  }
}
