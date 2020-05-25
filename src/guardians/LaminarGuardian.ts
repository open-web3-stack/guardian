import Joi from '@hapi/joi';
import { LaminarGuardianConfig } from '../types';
import { createLaminarTasks } from '../tasks';
import Guardian from './Guardian';
import createLaminarApi from '../tasks/laminarChain/createLaminarApi';

export default class LaminarGuardian extends Guardian {
  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('laminarChain').required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  getTasks(config: LaminarGuardianConfig) {
    const api$ = createLaminarApi(config.nodeEndpoint);
    return createLaminarTasks(api$);
  }
}
