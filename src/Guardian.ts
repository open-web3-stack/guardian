import joi from '@hapi/joi';
import { GuardianInterface, MonitorInterface } from './types';

export default class Guardian implements GuardianInterface {
  readonly validationSchema = joi.any();
  monitors: MonitorInterface[] = [];

  validateConfig<T>(config: T): T {
    const { error, value } = this.validationSchema.validate(config);
    if (error) {
      throw error;
    }
    return value;
  }

  start() {
    throw Error('implement me');
  }

  stop() {
    throw Error('implement me');
  }
}
