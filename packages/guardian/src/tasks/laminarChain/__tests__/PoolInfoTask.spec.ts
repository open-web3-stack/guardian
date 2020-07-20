import PoolInfoTask from '../PoolInfoTask';

describe('PoolInfoTask', () => {
  it('works with valid arguments', () => {
    expect(new PoolInfoTask({ poolId: 1 }).arguments).toStrictEqual({ poolId: 1 });
    expect(new PoolInfoTask({ poolId: [1] }).arguments).toStrictEqual({ poolId: [1] });
    expect(new PoolInfoTask({ poolId: 'all' }).arguments).toStrictEqual({ poolId: 'all' });
  });
});
