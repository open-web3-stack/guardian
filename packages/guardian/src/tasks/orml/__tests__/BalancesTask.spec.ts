import BalancesTask from '../BalancesTask';

describe('BalancesTask', () => {
  it('works with valid arguments', () => {
    expect(new BalancesTask({ account: 'alice', currencyId: 'FEUR' }).arguments).toStrictEqual({
      account: 'alice',
      currencyId: 'FEUR'
    });
    expect(new BalancesTask({ account: ['alice'], currencyId: ['FEUR'] }).arguments).toStrictEqual({
      account: ['alice'],
      currencyId: ['FEUR']
    });
  });
});
