import Joi from 'joi';
import { ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import BaseSubstrateGuardian from './BaseSubstrateGuardian';
import { customTypes } from '../customTypes';
import { SubstrateGuardianConfig } from '../types';

export default class SubstrateGuardian extends BaseSubstrateGuardian<SubstrateGuardianConfig> {
  async setup(config: SubstrateGuardianConfig) {
    const provider = new WsProvider(config.nodeEndpoint);
    const apiRx = await ApiRx.create({ provider, types: customTypes }).toPromise();
    return { apiRx };
  }

  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('substrateChain').required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }
}
