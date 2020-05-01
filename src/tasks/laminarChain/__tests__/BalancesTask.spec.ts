import { Observable } from 'rxjs';
import BalancesTask from '../BalancesTask';
import createLaminarApi from '../createLaminarApi';

describe('BalancesTask', () => {
  const api$ = createLaminarApi('ws://localhost:9944');
  const task = new BalancesTask(api$);

  it('works with valid arguments', () => {
    expect(task.call({ account: 'alice' })).toBeInstanceOf(Observable);
    expect(task.call({ account: ['aclie'] })).toBeInstanceOf(Observable);
  });

  it("doesn't work with invalid arguments", () => {
    // @ts-ignore
    expect(() => task.call({ account: '' })).toThrow(Error);
    // @ts-ignore
    expect(() => task.call()).toThrow(Error);
  });
});
