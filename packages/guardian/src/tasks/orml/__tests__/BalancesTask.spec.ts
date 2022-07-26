import BalancesTask from '../BalancesTask';

describe('BalancesTask', () => {
  it('works with valid arguments', () => {
    expect(new BalancesTask({ account: 'alice', currencyId: { token: 'DOT' } }).arguments).toStrictEqual({
      account: 'alice',
      currencyId: { token: 'DOT' }
    });
    expect(new BalancesTask({ account: ['alice'], currencyId: [{ token: 'DOT' }] }).arguments).toStrictEqual({
      account: ['alice'],
      currencyId: [{ token: 'DOT' }]
    });
  });
});
