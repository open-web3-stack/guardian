import { Observer } from 'rxjs';
import { ActionRegistry } from '../../src';

const registerAction = (method: string, stream$: Observer<any>) => {
  ActionRegistry.register(method, (_args: never, data: any) => {
    stream$.next(data);
  });
};

export default registerAction;
