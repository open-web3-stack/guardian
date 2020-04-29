import joi from '@hapi/joi';
import { MonitorInterface } from './types';
import Guardian from './Guardian';

export default class EthereumGuardian extends Guardian {
  validationSchema = joi.any();
  readonly monitors: MonitorInterface[];

  // eslint-disable-next-line
  constructor(config: any) {
    super();

    config = this.validateConfig(config);
  }

  start() {
    console.log('Running ethereum guardian...');
  }

  stop() {
    console.log('Stopping ethereum guardian...');
  }
}
