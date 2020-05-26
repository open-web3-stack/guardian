import Joi from '@hapi/joi';
import { Observable, from } from 'rxjs';
import { switchMap, map, flatMap } from 'rxjs/operators';
import { get, isArray, isNil } from 'lodash';
import { ApiRx } from '@polkadot/api';
import SubstrateTask from './SubstrateTask';

const createCall = (api: ApiRx, name: string, args: any[] = []): Observable<Output> => {
  const method = get(api.query, name);
  if (isNil(method)) throw Error(`cannot find storage ${name}`);

  return method.call(null, ...args).pipe(map((value) => ({ name, value })));
};

export type Output = { name: string; value: any };

export default class StorageTask extends SubstrateTask<Output> {
  validationSchema() {
    return Joi.object({
      name: Joi.alt(
        Joi.when('args', {
          then: Joi.string(),
          otherwise: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())),
        })
      ).required(),
      args: Joi.any(),
    }).required();
  }

  init(params: { name: string | string[]; args?: any | any[] }) {
    const { name, args } = params;

    return this.api$.pipe(
      switchMap((api) => {
        if (isArray(name)) {
          return from(name).pipe(flatMap((name) => createCall(api, name)));
        }
        return createCall(api, name, isArray(args) ? args : [args]);
      })
    );
  }
}
