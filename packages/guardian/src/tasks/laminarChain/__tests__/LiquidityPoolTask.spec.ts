import LiquidityPoolTask from '../LiquidityPoolTask';

describe('LiquidityPool', () => {
  it('works with valid arguments', () => {
    expect(new LiquidityPoolTask({ poolId: 1, currencyId: 'fTokens' }).arguments).toStrictEqual({
      poolId: 1,
      currencyId: 'fTokens',
      period: 30000,
    });
    expect(new LiquidityPoolTask({ poolId: [1], currencyId: 'all', period: 10000 }).arguments).toStrictEqual({
      poolId: [1],
      currencyId: 'all',
      period: 10000,
    });
    expect(new LiquidityPoolTask({ poolId: 'all', currencyId: ['FEUR', 'FJPY'] }).arguments).toStrictEqual({
      poolId: 'all',
      currencyId: ['FEUR', 'FJPY'],
      period: 30000,
    });
  });
});
