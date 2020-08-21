import { Observable, Subscriber } from 'rxjs';
import { autorun } from 'mobx';

export const autorun$ = <T>(callback: (subscriber: Subscriber<T>) => any): Observable<T> => {
  return new Observable<T>((subscriber) => {
    const dispose = autorun(() => callback(subscriber));
    return () => dispose();
  });
};
