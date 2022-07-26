import * as Joi from 'joi';
import { firstValueFrom } from 'rxjs';
import { ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import BaseSubstrateGuardian from './BaseSubstrateGuardian';
import { customTypes } from './customTypes';
import { SubstrateGuardianConfig } from './types';

export default class SubstrateGuardian<T extends SubstrateGuardianConfig> extends BaseSubstrateGuardian<T> {
  async setup(config: SubstrateGuardianConfig) {
    const provider = new WsProvider(config.nodeEndpoint);
    const apiRx = await firstValueFrom(ApiRx.create({ provider, types: customTypes } as any));
    return { apiRx };
  }

  validationSchema() {
    return Joi.object({
      chain: Joi.valid('substrate'),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required()
    }).required();
  }
}
