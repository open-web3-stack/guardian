import { flatMap, map } from 'lodash';
import { Codec } from '@polkadot/types/types';
import { TimestampedValue } from '@open-web3/orml-types/interfaces';
import { Observable, timer } from 'rxjs';
import { switchMap, distinctUntilChanged } from 'rxjs/operators';
import { RpcRxResult } from '@polkadot/api/types';

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

// FIXME: a trick to get value from TimestampedValue, need to fix
export const getValueFromTimestampValue = (origin: TimestampedValue): Codec => {
  if (origin && Reflect.has(origin.value, 'value')) {
    return (origin.value as any).value;
  }

  return origin.value;
};

export const isNonNull = <T>(value: T): value is NonNullable<T> => {
  return value != null;
};

export const observeRPC = <T>(method: RpcRxResult<any>, params: Parameters<any>, period = 30_000): Observable<T> => {
  return timer(0, period).pipe(
    switchMap(() => {
      return method(...params) as Observable<T>;
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) !== JSON.stringify(b))
  );
};
