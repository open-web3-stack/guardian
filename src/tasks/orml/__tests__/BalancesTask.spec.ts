import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import BalancesTask from '../BalancesTask';
import createLaminarApi from '../../laminarChain/createLaminarApi';

describe('BalancesTask', () => {
  const api$ = createLaminarApi('ws://localhost:9944').pipe(map(({ api }) => api));
  const task = new BalancesTask(api$);

  it('works with valid arguments', () => {
    expect(task.call({ account: 'alice', currencyId: 'FEUR' })).toBeInstanceOf(Observable);
    expect(task.call({ account: ['aclie'], currencyId: ['FEUR'] })).toBeInstanceOf(Observable);
  });

  it("doesn't work with invalid arguments", () => {
    // @ts-ignore
    expect(() => task.call({ account: '' })).toThrow(Error);
    // @ts-ignore
    expect(() => task.call()).toThrow(Error);
  });

  it('combination works', () => {
    expect(task.createPairs('alice', 'ausd')).toStrictEqual([{ account: 'alice', currencyId: 'ausd' }]);

    expect(task.createPairs(['alice', 'bob'], 'ausd')).toStrictEqual([
      { account: 'alice', currencyId: 'ausd' },
      { account: 'bob', currencyId: 'ausd' },
    ]);

    expect(task.createPairs('alice', ['ausd', 'feur'])).toStrictEqual([
      { account: 'alice', currencyId: 'ausd' },
      { account: 'alice', currencyId: 'feur' },
    ]);

    expect(task.createPairs(['alice', 'bob'], ['ausd', 'feur'])).toStrictEqual([
      { account: 'alice', currencyId: 'ausd' },
      { account: 'alice', currencyId: 'feur' },
      { account: 'bob', currencyId: 'ausd' },
      { account: 'bob', currencyId: 'feur' },
    ]);
  });
});
