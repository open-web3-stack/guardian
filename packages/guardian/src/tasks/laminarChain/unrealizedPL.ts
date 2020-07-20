import Big from 'big.js';
import { LaminarApi } from '@laminar/api';
import { MarginPosition, LiquidityPoolId, TradingPair } from '@laminar/types/interfaces';
import { StorageType } from '@laminar/types';
import { computedFn } from 'mobx-utils';
import getOraclePrice from './getOraclePrice';

const ONE = Big(1e18);

export default (laminarApi: LaminarApi, storage: StorageType) => {
  const oraclePrice = getOraclePrice(storage);

  return computedFn(
    (position: MarginPosition) => {
      const getAskSpread = (poolId: LiquidityPoolId, pair: TradingPair) => {
        const options = storage.marginLiquidityPools.poolTradingPairOptions(poolId, pair.toHex());
        if (!options) return null;
        const { askSpread } = options;
        return askSpread.isEmpty ? Big(0) : Big(askSpread.toString());
      };

      const getBidSpread = (poolId: LiquidityPoolId, pair: TradingPair) => {
        const options = storage.marginLiquidityPools.poolTradingPairOptions(poolId, pair.toHex());
        if (!options) return null;
        const { bidSpread } = options;
        return bidSpread.isEmpty ? Big(0) : Big(bidSpread.toString());
      };

      const getPrice = (pair: TradingPair) => {
        const base = oraclePrice(pair.base.toString());
        const quote = oraclePrice(pair.quote.toString());
        if (base && quote) {
          return Big(base).div(quote);
        }
        return null;
      };

      const getBidPrice = (poolId: LiquidityPoolId, pair: TradingPair) => {
        const price = getPrice(pair);
        const spread = getBidSpread(poolId, pair);
        if (price && spread) {
          return price.sub(spread.div(ONE));
        }
        return null;
      };

      const getAskPrice = (poolId: LiquidityPoolId, pair: TradingPair) => {
        const price = getPrice(pair);
        const spread = getAskSpread(poolId, pair);
        if (price && spread) {
          return price.add(spread.div(ONE));
        }
        return null;
      };

      const { poolId, pair, leveragedDebits, leveragedHeld, leverage } = position;

      const openPrice = Big(leveragedDebits.toString()).div(Big(leveragedHeld.toString())).abs();

      let currentPrice: Big | null = null;
      if (leverage.toString().startsWith('Long')) {
        currentPrice = getAskPrice(poolId, pair);
      } else {
        currentPrice = getBidPrice(poolId, pair);
      }

      const AUSDPrice = getPrice(laminarApi.api.createType('TradingPair', { base: pair.quote, quote: 'AUSD' }));

      if (!AUSDPrice || !currentPrice) return null;

      const priceDelta = currentPrice.sub(openPrice);
      const profit = Big(leveragedHeld.toString()).mul(priceDelta);

      // profit in AUSD
      return profit.mul(AUSDPrice);
    },
    { keepAlive: true }
  );
};
