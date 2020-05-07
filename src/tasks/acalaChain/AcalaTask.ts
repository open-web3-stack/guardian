import { ApiRx } from '@polkadot/api';
import { Observable } from 'rxjs';
import Task from '../Task';

export default class AcalaTask extends Task {
  public api$: Observable<ApiRx>;

  constructor(api$: Observable<ApiRx>) {
    super();
    this.api$ = api$;
  }
}
