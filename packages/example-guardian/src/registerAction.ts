import { Observer } from 'rxjs';
import { ActionRegistry } from '@open-web3/guardian';

const registerAction = (method: string, stream$: Observer<any>) => {
  ActionRegistry.register(method, (args: any, data: any) => {
    stream$.next(data);
  });
};

export default registerAction;
