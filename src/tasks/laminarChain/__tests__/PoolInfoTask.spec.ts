import { never } from 'rxjs';
import PoolInfoTask from '../PoolInfoTask';

describe('PoolInfoTask', () => {
  const task = new PoolInfoTask(never());

  it('works with valid arguments', () => {
    expect(task.validateCallArguments({ poolId: 1 })).toStrictEqual({ poolId: 1 });
    expect(task.validateCallArguments({ poolId: [1] })).toStrictEqual({ poolId: [1] });
    expect(task.validateCallArguments({ poolId: 'all' })).toStrictEqual({ poolId: 'all' });
  });

  it("doesn't work with invalid arguments", () => {
    expect(() => task.validateCallArguments({ poolId: '' })).toThrow(Error);
    expect(() => task.validateCallArguments()).toThrow(Error);
  });
});
