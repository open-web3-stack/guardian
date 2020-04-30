import { Observable } from 'rxjs';
import LiquidityPoolTask from '../LiquidityPoolTask';

describe('LiquidityPool', () => {
  const task = new LiquidityPoolTask();

  it('works with valid arguments', () => {
    expect(task.call({ poolId: 1, currencyId: null })).toBeInstanceOf(Observable);
    expect(task.call({ poolId: [1], currencyId: null })).toBeInstanceOf(Observable);
    expect(task.call({ poolId: 'all', currencyId: null })).toBeInstanceOf(Observable);
  });

  it("doesn't work with invalid arguments", () => {
    // @ts-ignore
    expect(() => task.call({ poolId: '' })).toThrow(Error);
    // @ts-ignore
    expect(() => task.call()).toThrow(Error);
  });
});
