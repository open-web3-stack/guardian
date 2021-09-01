import { Pool } from '@open-web3/guardian/types';
import { ActionRegistry } from '@open-web3/guardian';
import { setDefaultConfig } from '../utils';
import { config } from './config';

interface Token {
  token: string;
}

export default async () => {
  setDefaultConfig('./dex-price-guardian.yml');

  const { tokenA, tokenB } = config();

  let prevPrice: BigInt | null = null;

  ActionRegistry.register('dexPriceChange', (args: any, data: Pool) => {
    const pool: string[] = JSON.parse(data.currencyId).map((token: Token) => token.token);

    if (!(pool.includes(tokenA) && pool.includes(tokenB))) return;

    if (data.price !== 'NaN') {
      const price = BigInt(data.price);

      if (prevPrice == null) {
        prevPrice = price;
      } else if (prevPrice !== price) {
        const [token1, token2] = JSON.parse(data.currencyId);
        
        const currentPool = {};
        currentPool[token1.token] = data.baseLiquidity;
        currentPool[token2.token] = data.otherLiquidity;
        
        console.log(currentPool);
      }
    }
  });

  // start guardian
  require('@open-web3/guardian-cli');
};
