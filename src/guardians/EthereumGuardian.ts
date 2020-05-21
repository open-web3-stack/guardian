import Joi from '@hapi/joi';
import { MonitorInterface, EthereumGuardianConfig } from '../types';
import Guardian from './Guardian';

export default class EthereumGuardian extends Guardian {
  validationSchema = Joi.any();
  readonly monitors: MonitorInterface[];
  public readonly name: string;

  // eslint-disable-next-line
  constructor(name: string, config: EthereumGuardianConfig) {
    super();
    this.name = name;

    config = this.validateConfig(config);
  }

  start() {
    console.log(`Starting guardian ${this.name} ...`);
  }

  stop() {
    console.log(`Stopping guardian ${this.name} ...`);
  }
}
