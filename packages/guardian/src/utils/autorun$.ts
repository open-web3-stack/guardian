import { Observable, Subscriber } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { autorun } from 'mobx';
import { isEqual } from 'lodash';

export const autorun$ = <T>(callback: (subscriber: Subscriber<T>) => any): Observable<T> => {
  return new Observable<T>((subscriber) => {
    const dispose = autorun(() => callback(subscriber));
    return () => dispose();
  }).pipe(distinctUntilChanged(isEqual));
};
