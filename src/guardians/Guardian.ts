import { GuardianInterface, MonitorInterface } from '../types';
import Joi from '@hapi/joi';

export default abstract class Guardian implements GuardianInterface {
  abstract readonly validationSchema: Joi.Schema;
  monitors: MonitorInterface[] = [];

  readonly validateConfig = <T>(config: T): T => {
    const { error, value } = this.validationSchema.validate(config);
    if (error) {
      throw error;
    }
    return value;
  };

  abstract start(): void;

  abstract stop(): void;
}
