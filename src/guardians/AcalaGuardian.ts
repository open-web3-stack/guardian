import Joi from '@hapi/joi';
import { AcalaGuardianConfig } from '../types';
import { createAcalaTasks } from '../tasks';
import Guardian from './Guardian';
import { createAcalaApi } from '../tasks/acalaChain';
import { acalaNetwork } from '../constants';

const defaultNodeEndpoint = ({ network }: { network: AcalaGuardianConfig['network'] }) => {
  // TODO: update node endpoints
  switch (network) {
    case 'dev':
      return 'ws://localhost:9944';
    case 'mandala':
      return 'wss://testnet-node-1.acala.laminar.one/ws';
    case 'mainnet':
      return 'ws://localhost:9944';
  }
};

export default class AcalaGuardian extends Guardian {
  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('acalaChain').required(),
      network: Joi.valid(...acalaNetwork).required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).default(defaultNodeEndpoint),
    }).required();
  }

  getTasks(config: AcalaGuardianConfig) {
    const api$ = createAcalaApi(config.nodeEndpoint);
    return createAcalaTasks(api$);
  }
}
