import { never } from 'rxjs';
import TraderInfoTask from '../TraderInfoTask';

describe('TraderInfoTask', () => {
  const task = new TraderInfoTask(never());

  it('works with valid arguments', () => {
    expect(task.validateCallArguments({ account: 'alice', poolId: 'all' })).toStrictEqual({
      account: 'alice',
      poolId: 'all',
    });
    expect(task.validateCallArguments({ account: ['alice'], poolId: [1] })).toStrictEqual({
      account: ['alice'],
      poolId: [1],
    });
  });

  it("doesn't work with invalid arguments", () => {
    expect(() => task.validateCallArguments()).toThrow(Error);
    expect(() => task.validateCallArguments({})).toThrow(Error);
  });
});
