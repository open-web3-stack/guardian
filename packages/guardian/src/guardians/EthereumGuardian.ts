import Joi from '@hapi/joi';
import { EthereumApi } from '@laminar/api';
import Web3 from 'web3';
import Guardian from './Guardian';
import { ethereumNetwork } from '../constants';
import { EthereumGuardianConfig } from '../types';
import SyntheticPoolsTask from '../tasks/ethereum/SyntheticPoolsTask';
import MarginPoolsTask from '../tasks/ethereum/MarginPoolsTask';
import MarginAccountTask from '../tasks/ethereum/MarginAccountTask';

const defaultNodeEndpoint = ({ network }: { network: EthereumGuardianConfig['network'] }) => {
  if (network === 'dev') {
    return 'http://localhost:8545';
  }
  throw Error('nodeEndpoint is required if network !== dev');
};

export default class EthereumGuardian extends Guardian<EthereumGuardianConfig, { ethereumApi: EthereumApi }> {
  tasks() {
    return {
      'synthetic.pools': SyntheticPoolsTask,
      'margin.pools': MarginPoolsTask,
      'margin.account': MarginAccountTask,
    };
  }

  setup(config: EthereumGuardianConfig) {
    const ethereumApi = new EthereumApi({ provider: new Web3.providers.WebsocketProvider(config.nodeEndpoint) });
    return Promise.resolve({ ethereumApi });
  }

  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('ethereum').required(),
      network: Joi.valid(...ethereumNetwork).required(),
      nodeEndpoint: Joi.string().default(defaultNodeEndpoint),
    }).required();
  }
}
