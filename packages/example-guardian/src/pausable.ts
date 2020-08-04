import { Observable, Subject } from 'rxjs';
import { windowToggle, filter, flatMap, startWith, distinctUntilChanged } from 'rxjs/operators';

export const pausable = <T>(input$: Observable<T>) => {
  const subject$ = new Subject<boolean>();

  const pause = () => subject$.next(true);
  const resume = () => subject$.next(false);

  const pause$ = subject$.pipe(startWith(false), distinctUntilChanged());

  const on$ = pause$.pipe(filter((i) => !i));
  const off$ = pause$.pipe(filter((i) => i));

  const stream$ = input$.pipe(
    windowToggle(on$, () => off$),
    flatMap((i) => i)
  );

  return { stream$, pause, resume };
};
