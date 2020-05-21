import { flatMap, map } from 'lodash';

export /**
 * Create pair combination of account and currencyId
 * e.g.
 *  account: ['alice', 'bob'] & currencyId: 'AUSD' will return
 *  [
 *    { account:'alice', currencyId: 'AUSD'},
 *    { account:'bob', currencyId: 'AUSD'}
 *  ]
 *
 *  account: ['alice', 'bob'] & currencyId: ['AUSD', 'FEUR'] will return
 *  [
 *    { account:'alice', currencyId: 'AUSD'},
 *    { account:'bob', currencyId: 'AUSD'}
 *    { account:'alice', currencyId: 'FEUR'},
 *    { account:'bob', currencyId: 'FEUR'}
 *  ]
 *
 * @param {(string | string[])} account
 * @param {(string | string[])} currencyId
 * @returns {{ account: string; currencyId: string }[]}
 */
const createAccountCurrencyIdPairs = (
  account: string | string[],
  currencyId: string | string[]
): { account: string; currencyId: string }[] => {
  if (typeof account === 'string') {
    account = [account];
  }
  if (typeof currencyId === 'string') {
    currencyId = [currencyId];
  }

  return flatMap(account, (account) => map(currencyId, (currencyId) => ({ account, currencyId })));
};
