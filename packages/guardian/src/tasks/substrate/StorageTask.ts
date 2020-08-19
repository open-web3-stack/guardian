import Joi from 'joi';
import { Observable, from } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
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
          otherwise: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())),
        })
      ).required(),
      args: Joi.any(),
    }).required();
  }

  async start(guardian: BaseSubstrateGuardian) {
    const { apiRx } = await guardian.isReady();

    const { name, args } = this.arguments;

    if (isArray(name)) {
      return from(name).pipe(flatMap((name) => createCall(apiRx, name)));
    }
    return createCall(apiRx, name, isArray(args) ? args : [args]);
  }
}
