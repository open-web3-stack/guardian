import { Observable, Subject } from 'rxjs';
import { ActionRegistry } from '@open-web3/guardian';

const registerAction = <T>(method: string): Observable<{ args: any; data: T }> => {
  const subject = new Subject<{ args: any; data: T }>();

  ActionRegistry.register(method, (args: any, data: any) => {
    subject.next({ args, data });
  });

  return subject.asObservable();
};

export default registerAction;
