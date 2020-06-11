import { Observer } from 'rxjs';
import { ActionRegistry } from '../../src';

const registerAction = (method: string, stream$: Observer<any>) => {
  ActionRegistry.register(method, (args: any, data: any, task: any) => {
    stream$.next({
      data,
      task,
      args,
    });
  });
};

export default registerAction;
