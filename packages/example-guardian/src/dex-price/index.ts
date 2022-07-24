import { ActionRegistry } from '@open-web3/guardian';
import { Pool } from '@open-web3/acala-guardian';
import { setDefaultConfig } from '../utils';

const registerEventHandler = () => {
  let prevPrice: BigInt | null = null;

  ActionRegistry.register('dexPriceChange', (data: Pool) => {
    const newPrice = (data.price !== 'NaN' && BigInt(data.price)) || null;

    // taking action only if liquidity in pools has changed
    if (newPrice !== prevPrice) {
      const [base, quote] = JSON.parse(data.currencyId);

      const currentPool = {
        [base.token]: data.baseLiquidity,
        [quote.token]: data.otherLiquidity
      };
      currentPool[base.token] = data.baseLiquidity;
      currentPool[quote.token] = data.otherLiquidity;

      prevPrice = newPrice;

      console.log(currentPool);

      // @TODO: ADD CUSTOM LOGIC HERE
    }
  });
};

export const runPairMonitorBot = async () => {
  setDefaultConfig('./dex-price-guardian.yml');

  registerEventHandler();

  // start guardian
  require('@open-web3/guardian-cli');
};

export default runPairMonitorBot;
