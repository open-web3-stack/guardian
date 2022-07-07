import * as Joi from 'joi';
import { Observable, from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { get, isArray, isNil } from 'lodash';
import { ApiRx } from '@polkadot/api';
import Task from '../Task';
import BaseSubstrateGuardian from '../../guardians/BaseSubstrateGuardian';

const createCall = (api: ApiRx, name: string, args: any[] = []): Observable<Output> => {
  const method = get(api.query, name);
  if (isNil(method)) throw Error(`cannot find storage ${name}`);

  return method.call(undefined, ...args).pipe(map((value) => ({ name, value })));
};

export type Output = { name: string; value: any };

export default class StorageTask extends Task<{ name: string | string[]; args?: any | any[] }, Output> {
  validationSchema() {
    return Joi.object({
      name: Joi.alt(
        Joi.when('args', {
          then: Joi.string(),
          otherwise: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string()))
        })
      ).required(),
      args: Joi.any()
    }).required();
  }

  async start<T extends BaseSubstrateGuardian>(guardian: T) {
    const { apiRx } = await guardian.isReady();

    const { name, args } = this.arguments;

    if (isArray(name)) {
      return from(name).pipe(mergeMap((name) => createCall(apiRx, name)));
    }
    return createCall(apiRx, name, isArray(args) ? args : [args]);
  }
}
