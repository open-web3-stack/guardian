import { Codec } from '@polkadot/types/types';
import { StorageType as LaminarStorageType } from '@laminar/types';
import { StorageType as AcalaStorageType } from '@acala-network/types';

import { computedFn } from 'mobx-utils';

const median = (arr: number[]): number => {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const getOraclePrice = <CurrencyId extends Codec>(
  oracle: LaminarStorageType['laminarOracle'] | AcalaStorageType['acalaOracle']
) =>
  computedFn((tokenId: CurrencyId) => {
    if (['{"Token":"AUSD"}', 'AUSD'].includes(tokenId.toString())) return 1e18;
    const prices: number[] = [];
    const rawValues = oracle.rawValues.allEntries();

    for (const rawValue of rawValues.values()) {
      for (const [key, price] of rawValue.entries()) {
        if (key === tokenId.toString() && price.isSome) {
          prices.push(Number(price.unwrap().value.toString()));
        }
      }
    }

    if (prices.length > 0) {
      return median(prices);
    }
    return null;
  });

export default getOraclePrice;
