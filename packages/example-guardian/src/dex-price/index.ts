import { Pool } from '@open-web3/guardian/types';
import { ActionRegistry } from '@open-web3/guardian';
import { setDefaultConfig } from '../utils';

export default () => {
  setDefaultConfig('acala-dex-price-guardian.yml');

  let prevPrice: BigInt | null = null;

  ActionRegistry.register('dexPriceChange', (args: any, data: Pool) => {
    if (data.price != 'NaN') {
      const price = BigInt(data.price);

      if (prevPrice == null) {
        prevPrice = price;
      } else if (prevPrice != price) {
        prevPrice = price;
        console.log(`New Price: ${price}`);
      }
    }
  });

  // start guardian
  require('@open-web3/guardian-cli');
};