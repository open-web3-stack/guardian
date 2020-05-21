import { never } from 'rxjs';
import LiquidityPoolTask from '../LiquidityPoolTask';

describe('LiquidityPool', () => {
  const task = new LiquidityPoolTask(never());

  it('works with valid arguments', () => {
    expect(task.validateCallArguments({ poolId: 1, currencyId: null })).toStrictEqual({ poolId: 1, currencyId: null });
    expect(task.validateCallArguments({ poolId: [1], currencyId: null })).toStrictEqual({
      poolId: [1],
      currencyId: null,
    });
    expect(task.validateCallArguments({ poolId: 'all', currencyId: null })).toStrictEqual({
      poolId: 'all',
      currencyId: null,
    });
  });

  it("doesn't work with invalid arguments", () => {
    expect(() => task.validateCallArguments({ poolId: '' })).toThrow(Error);
    expect(() => task.validateCallArguments()).toThrow(Error);
  });
});
