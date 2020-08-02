import { ApiRx } from '@polkadot/api';
import { Observable, range } from 'rxjs';
import { map, filter, distinctUntilChanged, switchMap, pairwise, startWith, tap } from 'rxjs/operators';
import { Option } from '@polkadot/types/codec';
import { Codec } from '@polkadot/types/types';

// TODO: this should be removed
export /**
 * Stream of auction ids
 *
 * @param {ApiRx} api
 * @returns Observable<number>
 */
const getAuctionsIds = (api: ApiRx): Observable<number> => {
  const auctionsIndex$ = api.query.auction.auctionsIndex().pipe(map((result) => Number.parseInt(result.toString())));

  return auctionsIndex$.pipe(
    startWith(0),
    pairwise(),
    filter(([, next]) => next > 0),
    switchMap(([prev, next]) => range(prev, next)),
    distinctUntilChanged()
  );
};

export const unwrapOptionalCodec = <T extends Codec>(stream$: Observable<Option<T>>): Observable<T> => {
  return stream$.pipe(
    filter((i) => i.isSome),
    map((i) => i.unwrap())
  );
};
