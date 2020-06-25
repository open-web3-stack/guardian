import Joi from '@hapi/joi';
import { AsyncSubject } from 'rxjs';
import { ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { SubstrateGuardianConfig } from '../types';
import { createSubstrateTasks } from '../tasks';
import Guardian from './Guardian';
import { customTypes } from '../customTypes';

const createApi = (nodeEndpoint: string | string[]) => {
  const api$ = new AsyncSubject<ApiRx>();
  const api = new ApiRx({ provider: new WsProvider(nodeEndpoint), types: customTypes });
  api.once('ready', () => {
    api$.next(api);
    api$.complete();
  });
  return api$;
};

export default class SubstrateGuardian extends Guardian {
  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('substrateChain').required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  getTasks(config: SubstrateGuardianConfig) {
    const api$ = createApi(config.nodeEndpoint);
    return createSubstrateTasks(api$);
  }
}
