import { Observable } from 'rxjs';
import { ApiRx } from '@polkadot/api';
import Task from '../Task';

export default abstract class SubstrateTask<Output> extends Task<Output> {
  public readonly api$: Observable<ApiRx>;

  constructor(api$: Observable<ApiRx>) {
    super();
    this.api$ = api$;
  }
}
