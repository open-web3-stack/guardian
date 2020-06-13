import { LaminarApi } from '@laminar/api';
import { Observable } from 'rxjs';
import Task from '../Task';

export default abstract class LaminarTask<Output> extends Task<Output> {
  public chainApi$: Observable<LaminarApi>;

  constructor(chainApi$: Observable<LaminarApi>) {
    super();
    this.chainApi$ = chainApi$;
  }
}
