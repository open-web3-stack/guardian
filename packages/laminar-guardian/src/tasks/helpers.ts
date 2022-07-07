import { castArray } from 'lodash';
import { AugmentedRpc } from '@polkadot/api/types';
import { Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
const createAccountCurrencyIdPairs = <CurrencyId>(
  account: string | string[],
  currencyId: CurrencyId | CurrencyId[]
): { account: string; currencyId: CurrencyId }[] => {
  return castArray(account).flatMap((account) => castArray(currencyId).map((currencyId) => ({ account, currencyId })));
};

export const isNonNull = <T>(value: T): value is NonNullable<T> => {
  return value != null;
};

export const observeRPC = <T>(method: AugmentedRpc<any>, params: Parameters<any>, period: number): Observable<T> => {
  return timer(0, period).pipe(
    switchMap(() => {
      return method(...params) as Observable<T>;
    })
  );
};
