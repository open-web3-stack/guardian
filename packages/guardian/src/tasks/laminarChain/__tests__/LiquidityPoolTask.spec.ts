import { never } from 'rxjs';
import LiquidityPoolTask from '../LiquidityPoolTask';

describe('LiquidityPool', () => {
  const task = new LiquidityPoolTask(never());

  it('works with valid arguments', () => {
    expect(task.validateCallArguments({ poolId: 1, currencyId: 'fTokens' })).toStrictEqual({
      poolId: 1,
      currencyId: 'fTokens',
      period: 30000,
    });
    expect(task.validateCallArguments({ poolId: [1], currencyId: 'all', period: 10000 })).toStrictEqual({
      poolId: [1],
      currencyId: 'all',
      period: 10000,
    });
    expect(task.validateCallArguments({ poolId: 'all', currencyId: ['FEUR', 'FJPY'] })).toStrictEqual({
      poolId: 'all',
      currencyId: ['FEUR', 'FJPY'],
      period: 30000,
    });
  });

  it("doesn't work with invalid arguments", () => {
    expect(() => task.validateCallArguments({ poolId: '' })).toThrow(Error);
    expect(() => task.validateCallArguments()).toThrow(Error);
  });
});
