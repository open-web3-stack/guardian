import { castArray } from 'lodash';
import Big from 'big.js';
import { Codec } from '@polkadot/types/types';
import { Option } from '@polkadot/types/codec';
import { Event } from '@polkadot/types/interfaces';
import { TimestampedValue } from '@open-web3/orml-types/interfaces';
import { Observable, timer, of } from 'rxjs';
import { switchMap, filter, map } from 'rxjs/operators';
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
const createAccountCurrencyIdPairs = <CurrencyId>(
  account: string | string[],
  currencyId: CurrencyId | CurrencyId[]
): { account: string; currencyId: CurrencyId }[] => {
  return castArray(account).flatMap((account) => castArray(currencyId).map((currencyId) => ({ account, currencyId })));
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

export const observeRPC = <T>(method: any, params: Parameters<any>, period: number): Observable<T> => {
  return timer(0, period).pipe(
    switchMap(() => {
      return method(...params) as Observable<T>;
    })
  );
};

export const getOraclePrice =
  <CurrencyId extends Codec>(api: ApiRx, period: number, fixedPrices: Record<string, Big> = {}) =>
  (tokenId: CurrencyId) => {
    const fixedPrice = fixedPrices[tokenId.toString()];
    if (fixedPrice) {
      return of(fixedPrice);
    }

    const price$ = observeRPC<Option<TimestampedValue>>(api.rpc['oracle']['getValue'], ['Aggregated', tokenId], period);

    return price$.pipe(
      filter((i) => i.isSome),
      map((i) => i.unwrap()),
      map((i) => Big(getValueFromTimestampValue(i).toString()))
    );
  };

export const getEventParams = (event: Event): string[] => {
  // try to find fields name if it's struct format
  const params = event.data.meta.fields?.map((x) => x.name.isSome && x.name.unwrap().toString()).filter((x) => !!x);
  if (params?.length) {
    return params as string[];
  }

  // try to find fields name from documentation
  const args = event.meta.docs
    .reverse()
    .map((i) => i.toString())
    .map((doc) => {
      // try regex \[ key1, key2 \]
      let results = /\\\[(.*?)\\\]/gm.exec(doc);
      if (!results) {
        // try different regex [ key1, key2 ]
        results = /\[(.*?)\]/gm.exec(doc);
      }
      return results ? (results.length > 1 ? results[1].split(',').map((x) => x.trim()) : []) : [];
    });

  if (args.length > 0) {
    return args[0];
  }
  return [];
};
