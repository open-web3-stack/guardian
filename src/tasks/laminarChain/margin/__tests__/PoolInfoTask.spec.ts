import { Observable } from 'rxjs';
import PoolInfoTask from '../PoolInfoTask';

describe('PoolInfoTask', () => {
  const task = new PoolInfoTask();

  it('works with valid arguments', () => {
    expect(task.call({ poolId: 1 })).toBeInstanceOf(Observable);
    expect(task.call({ poolId: [1] })).toBeInstanceOf(Observable);
    expect(task.call({ poolId: 'all' })).toBeInstanceOf(Observable);
  });

  it("doesn't work with invalid arguments", () => {
    // @ts-ignore
    expect(() => task.call({ poolId: '' })).toThrow(Error);
    // @ts-ignore
    expect(() => task.call()).toThrow(Error);
  });
});
