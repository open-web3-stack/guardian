import { createAccountCurrencyIdPairs } from '../helpers';

describe('helpers', () => {
  it('combination works', () => {
    expect(createAccountCurrencyIdPairs('alice', 'ausd')).toStrictEqual([{ account: 'alice', currencyId: 'ausd' }]);

    expect(createAccountCurrencyIdPairs(['alice', 'bob'], 'ausd')).toStrictEqual([
      { account: 'alice', currencyId: 'ausd' },
      { account: 'bob', currencyId: 'ausd' }
    ]);

    expect(createAccountCurrencyIdPairs('alice', ['ausd', 'feur'])).toStrictEqual([
      { account: 'alice', currencyId: 'ausd' },
      { account: 'alice', currencyId: 'feur' }
    ]);

    expect(createAccountCurrencyIdPairs(['alice', 'bob'], ['ausd', 'feur'])).toStrictEqual([
      { account: 'alice', currencyId: 'ausd' },
      { account: 'alice', currencyId: 'feur' },
      { account: 'bob', currencyId: 'ausd' },
      { account: 'bob', currencyId: 'feur' }
    ]);
  });
});
