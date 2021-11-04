import Joi from 'joi';
import { firstValueFrom } from 'rxjs';
import { ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import BaseSubstrateGuardian from './BaseSubstrateGuardian';
import { customTypes } from '../customTypes';
import { SubstrateGuardianConfig } from '../types';

export default class SubstrateGuardian extends BaseSubstrateGuardian<SubstrateGuardianConfig> {
  async setup(config: SubstrateGuardianConfig) {
    const { networkType } = config;
    this._metadata = { ...this._metadata, networkType };
    const provider = new WsProvider(config.nodeEndpoint);
    const apiRx = await firstValueFrom(ApiRx.create({ provider, types: customTypes }));
    return { apiRx };
  }

  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('substrateChain').required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required()
    }).required();
  }
}
