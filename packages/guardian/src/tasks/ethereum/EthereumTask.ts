import { Observable } from 'rxjs';
import { EthereumApi } from '@laminar/api';
import Task from '../Task';

export default abstract class EthereumTask<Output> extends Task<Output> {
  public readonly api$: Observable<EthereumApi>;

  constructor(api$: Observable<EthereumApi>) {
    super();
    this.api$ = api$;
  }
}
