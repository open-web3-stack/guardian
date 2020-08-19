import Big from 'big.js';
import { Codec } from '@polkadot/types/types';
import { Option } from '@polkadot/types/codec';
import { Event } from '@polkadot/types/interfaces';
import { TimestampedValue } from '@open-web3/orml-types/interfaces';
import { Observable, timer, of } from 'rxjs';
import { switchMap, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { RpcRxResult } from '@polkadot/api/types';
import { ApiRx } from '@polkadot/api';

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
  const accounts = Array.isArray(account) ? account : [account];
  const currencyIds = Array.isArray(currencyId) ? currencyId : [currencyId];

  return accounts.flatMap((account) => currencyIds.map((currencyId) => ({ account, currencyId })));
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
    })
  );
};

export const getOraclePrice = (api: ApiRx, period = 30_000) => (tokenId: string) => {
  // acala chain
  if (api.consts.cdpTreasury) {
    const stableCurrencyId = api.consts.cdpTreasury.getStableCurrencyId.toString().toLowerCase();
    const stableCurrencyIdPrice = api.consts.prices.stableCurrencyFixedPrice.toString();
    if (tokenId.toLowerCase() === stableCurrencyId) return of(Big(stableCurrencyIdPrice));
  } else {
    if (tokenId.toLowerCase() === 'ausd') return of(Big(1e18));
  }

  const price$ = observeRPC<Option<TimestampedValue>>(api.rpc['oracle'].getValue, [tokenId], period);

  return price$.pipe(
    filter((i) => i.isSome),
    map((i) => i.unwrap()),
    map((i) => Big(getValueFromTimestampValue(i).toString())),
    distinctUntilChanged((a, b) => a.eq(b))
  );
};

export const getEventParams = (event: Event): string[] => {
  const argsStr = event.meta.documentation
    .reverse()
    .map((i) => i.toString())
    .map((doc) => {
      const results = /\[(\w?,?\s?)+\]/gm.exec(doc);
      return results && results.length > 0 && results[0];
    })
    .filter((i): i is string => !!i);

  if (argsStr.length > 0) {
    return argsStr[0]
      .slice(1)
      .slice(0, -1)
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i !== '');
  }
  return [];
};
