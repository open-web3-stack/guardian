import { Observable } from 'rxjs';
import TraderInfoTask from '../TraderInfoTask';

describe('TraderInfoTask', () => {
  const task = new TraderInfoTask();

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
