import { Observable } from 'rxjs';
import LiquidityPoolTask from '../LiquidityPoolTask';
import createLaminarApi from '../createLaminarApi';

describe('LiquidityPool', () => {
  const api$ = createLaminarApi('ws://localhost:9944');
  const task = new LiquidityPoolTask(api$);

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
