import Joi from '@hapi/joi';
import { AsyncSubject } from 'rxjs';
import { ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { SubstrateGuardianConfig } from '../types';
import { createSubstrateTasks } from '../tasks';
import Guardian from './Guardian';

const createApi = (nodeEndpoint: string | string[]) => {
  const api$ = new AsyncSubject<ApiRx>();
  const api = new ApiRx({ provider: new WsProvider(nodeEndpoint) });
  api.once('ready', () => {
    api$.next(api);
    api$.complete();
  });
  return api$;
};

export default class SubstrateGuardian extends Guardian {
  validationSchema() {
    return Joi.object().required();
  }

  getTasks(config: SubstrateGuardianConfig) {
    const api$ = createApi(config.nodeEndpoint);
    return createSubstrateTasks(api$);
  }
}
