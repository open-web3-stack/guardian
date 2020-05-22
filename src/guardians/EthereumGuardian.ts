import Joi from '@hapi/joi';
import { EthereumGuardianConfig } from '../types';
import Guardian from './Guardian';

export default class EthereumGuardian extends Guardian {
  validationSchema() {
    return Joi.object().required();
  }

  getTasks(config: EthereumGuardianConfig) {
    return {};
  }
}
