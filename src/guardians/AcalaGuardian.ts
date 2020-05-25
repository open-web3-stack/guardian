import Joi from '@hapi/joi';
import { AcalaGuardianConfig } from '../types';
import { createAcalaTasks } from '../tasks';
import Guardian from './Guardian';
import { createAcalaApi } from '../tasks/acalaChain';

export default class AcalaGuardian extends Guardian {
  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('acalaChain').required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  getTasks(config: AcalaGuardianConfig) {
    const api$ = createAcalaApi(config.nodeEndpoint);
    return createAcalaTasks(api$);
  }
}
