import joi from '@hapi/joi';
import { MonitorInterface, EthereumGuardianConfig } from './types';
import Guardian from './Guardian';

export default class EthereumGuardian extends Guardian {
  validationSchema = joi.any();
  readonly monitors: MonitorInterface[];
  public readonly name: string;

  // eslint-disable-next-line
  constructor(name: string, config: EthereumGuardianConfig) {
    super();
    this.name = name;

    config = this.validateConfig(config);
  }

  start() {
    console.log(`Starting ${this.name}`);
  }

  stop() {
    console.log(`Stopping ${this.name}`);
  }
}
