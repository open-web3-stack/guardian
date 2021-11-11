import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';
import { Option } from '@polkadot/types/codec';
import { TimestampedValueOf } from '@open-web3/orml-types/interfaces';
import { CurrencyId } from '@laminar/types/interfaces';

const median = (arr: number[]): number => {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const getOraclePrice = (apiRx: ApiRx) => (tokenId: CurrencyId) => {
  if (tokenId.toString() === 'AUSD') return of(1e18);
  return apiRx.query.laminarOracle.rawValues.entries().pipe(
    map((entry) => {
      const prices = entry
        .filter(([storageKey]) => {
          const [, key] = storageKey.args;
          if (key.eq(tokenId)) return true;
          return false;
        })
        .map(([, value]) => value as Option<TimestampedValueOf>)
        .filter((price) => price.isSome)
        .map((price) => Number(price.unwrap().value.toString()))
        .reduce((acc: number[], next) => {
          acc.push(next);
          return acc;
        }, []);

      return median(prices);
    })
  );
};

export default getOraclePrice;
