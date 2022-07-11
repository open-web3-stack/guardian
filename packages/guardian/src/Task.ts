import * as Joi from 'joi';
import { Observable } from 'rxjs';
import { ITask, IGuardian } from './types';

export default abstract class Task<P extends Record<string, unknown>, O> implements ITask<P, O> {
  private _params: P = {} as P;
  constructor(params: P) {
    this.setParams(params);
  }

  public get arguments(): P {
    return this._params;
  }

  private setParams(params: P) {
    const { error, value } = this.validationSchema().validate(params);
    if (error) {
      throw error;
    }
    this._params = value;
  }

  abstract validationSchema(): Joi.Schema;

  abstract start(guardian: IGuardian): Promise<Observable<O>>;
}
