import { Pool } from '@open-web3/guardian/types';
import { ActionRegistry } from '@open-web3/guardian';
import { setDefaultConfig } from '../utils';
import { config } from './config';

interface Token {
  token: string;
}

const registerEventHandler = () => {
  const { tokenA, tokenB } = config();

  console.log('-'.repeat(20));
  console.log(`PAIR:  ${tokenA} - ${tokenB}`);
  console.log('-'.repeat(20));

  let prevPrice: BigInt | null = null;

  ActionRegistry.register('dexPriceChange', (data: Pool) => {
    const pool: string[] = JSON.parse(data.currencyId).map((token: Token) => token.token);

    if (!(pool.includes(tokenA) && pool.includes(tokenB))) {
      return;
    }

    const newPrice = (data.price !== 'NaN' && BigInt(data.price)) || null;

    // taking action only if liquidity in pools has changed
    if (newPrice !== prevPrice) {
      const [tokenA, tokenB] = JSON.parse(data.currencyId);

      const currentPool = {
        [tokenA.token]: data.baseLiquidity,
        [tokenB.token]: data.otherLiquidity
      };
      currentPool[tokenA.token] = data.baseLiquidity;
      currentPool[tokenB.token] = data.otherLiquidity;

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
