import joi from '@hapi/joi';
import { Observable, never } from 'rxjs';
import { TaskInterface } from '../types';

export default class Task implements TaskInterface {
  validationSchema = joi.any();

  validateParameters<T>(params?: T): T {
    const { error, value } = this.validationSchema.validate(params);
    if (error) {
      throw Error(`margin.poolInfo: ${error.message}`);
    }
    return value;
  }

  // eslint-disable-next-line
  call(params?: any): Observable<any> {
    return never();
  }
}
