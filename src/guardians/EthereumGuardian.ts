import Joi from '@hapi/joi';
import { EthereumGuardianConfig } from '../types';
import Guardian from './Guardian';
import { ethereumNetwork } from '../constants';

const defaultNodeEndpoint = ({ network }: { network: EthereumGuardianConfig['network'] }) => {
  if (network === 'dev') {
    return 'http://localhost:8545';
  }
  throw Error('nodeEndpoint is required if network !== dev');
};

export default class EthereumGuardian extends Guardian {
  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('ethereum').required(),
      network: Joi.valid(...ethereumNetwork).required(),
      nodeEndpoint: Joi.string().default(defaultNodeEndpoint),
    }).required();
  }

  getTasks(config: EthereumGuardianConfig) {
    return {};
  }
}
