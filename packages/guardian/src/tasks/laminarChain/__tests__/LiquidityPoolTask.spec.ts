import { never } from 'rxjs';
import LiquidityPoolTask from '../LiquidityPoolTask';

describe('LiquidityPool', () => {
  const task = new LiquidityPoolTask(never());

  it('works with valid arguments', () => {
    expect(task.validateCallArguments({ poolId: 1, currencyId: 'fTokens' })).toStrictEqual({
      poolId: 1,
      currencyId: 'fTokens',
    });
    expect(task.validateCallArguments({ poolId: [1], currencyId: 'all' })).toStrictEqual({
      poolId: [1],
      currencyId: 'all',
    });
    expect(task.validateCallArguments({ poolId: 'all', currencyId: ['FEUR', 'FJPY'] })).toStrictEqual({
      poolId: 'all',
      currencyId: ['FEUR', 'FJPY'],
    });
  });

  it("doesn't work with invalid arguments", () => {
    expect(() => task.validateCallArguments({ poolId: '' })).toThrow(Error);
    expect(() => task.validateCallArguments()).toThrow(Error);
  });
});
