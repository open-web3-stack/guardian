import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { pausable } from '../pausable';

describe('pausable', () => {
  it('works', (done) => {
    const a$ = timer(0, 100).pipe(take(10));

    const { stream$, pause, resume } = pausable(a$);

    const output: number[] = [];

    stream$.subscribe((i) => {
      output.push(i);
    });

    // pause after 0.3 sec
    setTimeout(() => {
      pause();
    }, 300);

    // resume after 0.6 sec
    setTimeout(() => {
      resume();
    }, 600);

    // check result after 2 sec
    setTimeout(() => {
      expect(output).toStrictEqual([0, 1, 2, 6, 7, 8, 9]);
      done();
    }, 2_000);
  }, 5_000 /** timeout */);
});
