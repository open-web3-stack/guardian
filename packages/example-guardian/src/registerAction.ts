import { Observable } from 'rxjs';
import { ActionRegistry } from '@open-web3/guardian';

const registerAction = <T>(method: string): Observable<{ args: any; data: T }> => {
  return new Observable((subscriber) => {
    ActionRegistry.register(method, (args: any, data: any) => {
      subscriber.next({ args, data });
    });
  });
};

export default registerAction;
