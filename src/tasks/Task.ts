import Joi from '@hapi/joi';
import { Observable } from 'rxjs';
import { TaskInterface } from '../types';

export default abstract class Task<Output> implements TaskInterface<Output> {
  abstract validationSchema: Joi.Schema;

  abstract init(params: any): Observable<Output>;

  readonly validateCallArguments = <T>(args?: T): T => {
    const { error, value } = this.validationSchema.validate(args);
    if (error) {
      throw error;
    }
    return value;
  };

  readonly run = (params: any): Observable<Output> => {
    return this.init(this.validateCallArguments(params));
  };
}
