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
    const tokenIdStr = tokenId.toString();
    if (tokenIdStr.includes('AUSD')) return 1e18;
    if (tokenIdStr.includes('KUSD')) return 1e18;
    const prices: number[] = [];
    const rawValues = oracle.rawValues.allEntries();

    for (const rawValue of rawValues.values()) {
      for (const [key, price] of rawValue.entries()) {
        if (key === tokenIdStr && price.isSome) {
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
