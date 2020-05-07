import { LaminarApi } from '@laminar/api';
import { Observable } from 'rxjs';
import Task from '../Task';

export default class LaminarTask extends Task {
  public chainApi$: Observable<LaminarApi>;

  constructor(chainApi$: Observable<LaminarApi>) {
    super();
    this.chainApi$ = chainApi$;
  }
}
