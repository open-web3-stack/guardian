import Joi from 'joi';
import { Observable } from 'rxjs';
import { ITask, IGuardian } from '../types';

export default abstract class Task<P extends Record<string, any>, O> implements ITask<P, O> {
  constructor(private _arguments: P) {
    this.setArguments(_arguments);
  }

  public get arguments(): P {
    return this._arguments;
  }

  public setArguments(_arguments: P) {
    const { error, value } = this.validationSchema().validate(_arguments);
    if (error) {
      throw error;
    }
    this._arguments = value;
  }

  abstract validationSchema(): Joi.Schema;

  abstract start(guardian: IGuardian): Promise<Observable<O>>;
}
