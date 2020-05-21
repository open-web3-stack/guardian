import { ApiRx } from '@polkadot/api';
import { Observable } from 'rxjs';
import Task from '../Task';

export default abstract class AcalaTask<Output> extends Task<Output> {
  public api$: Observable<ApiRx>;

  constructor(api$: Observable<ApiRx>) {
    super();
    this.api$ = api$;
  }
}
