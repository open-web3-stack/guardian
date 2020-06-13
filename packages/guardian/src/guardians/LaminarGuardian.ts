import Joi from '@hapi/joi';
import { LaminarGuardianConfig } from '../types';
import { createLaminarTasks } from '../tasks';
import Guardian from './Guardian';
import createLaminarApi from '../tasks/laminarChain/createLaminarApi';
import { laminarNetwork } from '../constants';

const defaultNodeEndpoint = ({ network }: { network: LaminarGuardianConfig['network'] }) => {
  // TODO: update node endpoints
  switch (network) {
    case 'dev':
      return 'ws://localhost:9944';
    case 'turbulence':
      return 'ws://localhost:9944';
    case 'reynolds':
      return 'ws://localhost:9944';
    case 'mainnet':
      return 'ws://localhost:9944';
  }
};

export default class LaminarGuardian extends Guardian {
  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('laminarChain').required(),
      network: Joi.valid(...laminarNetwork).required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).default(defaultNodeEndpoint),
    }).required();
  }

  getTasks(config: LaminarGuardianConfig) {
    const api$ = createLaminarApi(config.nodeEndpoint);
    return createLaminarTasks(api$);
  }
}
