import { ApiRx } from '@polkadot/api';
import { of, Observable } from 'rxjs';
import { map, concat, take, skip, filter, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Option } from '@polkadot/types/codec';
import { Codec } from '@polkadot/types/types';

export /**
 * Stream of auction ids
 *
 * @param {ApiRx} api
 * @returns Observable<number>
 */
const getAuctionsIds = (api: ApiRx): Observable<number> => {
  const auctionsIndex$ = api.query.auction.auctionsIndex().pipe(map((result) => Number.parseInt(result.toString())));

  return auctionsIndex$.pipe(
    take(1),
    switchMap((currentIndex) => {
      // currentIndex: 0 -> []
      // currentIndex: 1 -> [0]
      // currentIndex: 2 -> [0, 1]
      // currentIndex: 3 -> [0, 1, 2]
      const currentIds$ = of(...(currentIndex > 0 ? Array.from(Array(currentIndex).keys()) : []));

      const upcomingIds$ = auctionsIndex$.pipe(
        skip(1),
        map((i) => i - 1)
      );

      // concat current ids with upcoming ids
      return currentIds$.pipe(concat(upcomingIds$), distinctUntilChanged());
    })
  );
};

export const unwrapOptionalCodec = <T extends Codec>(stream$: Observable<Option<T>>): Observable<T> => {
  return stream$.pipe(
    filter((i) => i.isSome),
    map((i) => i.unwrap())
  );
};
