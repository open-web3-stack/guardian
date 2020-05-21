import { never } from 'rxjs';
import TraderInfoTask from '../TraderInfoTask';

describe('TraderInfoTask', () => {
  const task = new TraderInfoTask(never());

  it('works with valid arguments', () => {
    expect(task.validateCallArguments({ account: 'alice' })).toStrictEqual({ account: 'alice' });
    expect(task.validateCallArguments({ account: ['alice'] })).toStrictEqual({ account: ['alice'] });
  });

  it("doesn't work with invalid arguments", () => {
    expect(() => task.validateCallArguments()).toThrow(Error);
    expect(() => task.validateCallArguments({})).toThrow(Error);
  });
});
