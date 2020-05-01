import { Observable } from 'rxjs';
import TraderInfoTask from '../TraderInfoTask';
import createLaminarApi from '../createLaminarApi';

describe('TraderInfoTask', () => {
  const api$ = createLaminarApi('ws://localhost:9944');
  const task = new TraderInfoTask(api$);

  it('works with valid arguments', () => {
    expect(task.call({ account: 'alice' })).toBeInstanceOf(Observable);
    expect(task.call({ account: ['alice'] })).toBeInstanceOf(Observable);
  });

  it("doesn't work with invalid arguments", () => {
    // @ts-ignore
    expect(() => task.call()).toThrow(Error);
    // expect(() => task.call({})).toThrow(Error);
  });
});
