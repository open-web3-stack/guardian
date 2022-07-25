import Big from 'big.js';
import { Observable, combineLatest } from 'rxjs';
import { map, combineLatestWith } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';
import { MarginPosition, LiquidityPoolId, TradingPair, MarginPoolTradingPairOption } from '@laminar/types/interfaces';
import { utils } from '@open-web3/guardian';
import { RPCRefreshPeriod } from '../constants';

const ONE = Big(1e18);

export default (apiRx: ApiRx) => {
  const oraclePrice$ = utils.getOraclePrice(apiRx, RPCRefreshPeriod, { AUSD: Big(1e18) });

  return (position: MarginPosition) => {
    const getAskSpread$ = (poolId: LiquidityPoolId, pair: TradingPair) => {
      return apiRx.query.marginLiquidityPools.poolTradingPairOptions<MarginPoolTradingPairOption>(poolId, pair).pipe(
        map((options) => {
          const { askSpread } = options;
          return askSpread.isEmpty ? Big(0) : Big(askSpread.toString());
        })
      );
    };

    const getBidSpread$ = (poolId: LiquidityPoolId, pair: TradingPair) => {
      return apiRx.query.marginLiquidityPools.poolTradingPairOptions<MarginPoolTradingPairOption>(poolId, pair).pipe(
        map((options) => {
          const { bidSpread } = options;
          return bidSpread.isEmpty ? Big(0) : Big(bidSpread.toString());
        })
      );
    };

    const getPrice$ = (pair: TradingPair) =>
      combineLatest([oraclePrice$(pair.base as any), oraclePrice$(pair.quote as any)]).pipe(
        map(([base, quote]) => Big(base).div(quote))
      );

    const getBidPrice$ = (poolId: LiquidityPoolId, pair: TradingPair) =>
      combineLatest([getPrice$(pair), getBidSpread$(poolId, pair)]).pipe(
        map(([price, spread]) => price.sub(spread.div(ONE)))
      );

    const getAskPrice$ = (poolId: LiquidityPoolId, pair: TradingPair) =>
      combineLatest([getPrice$(pair), getAskSpread$(poolId, pair)]).pipe(
        map(([price, spread]) => price.add(spread.div(ONE)))
      );

    const { poolId, pair, leveragedDebits, leveragedHeld, leverage } = position;

    const openPrice = Big(leveragedDebits.toString()).div(Big(leveragedHeld.toString())).abs();

    let currentPrice$: Observable<Big>;
    if (leverage.toString().startsWith('Long')) {
      currentPrice$ = getAskPrice$(poolId, pair);
    } else {
      currentPrice$ = getBidPrice$(poolId, pair);
    }
    const ausdPair = apiRx.createType('TradingPair', { base: pair.quote.toString(), quote: 'AUSD' });
    const AUSDPrice$ = getPrice$(ausdPair as any);

    return currentPrice$.pipe(
      map((current) => current.sub(openPrice)),
      map((priceDelta) => Big(leveragedHeld.toString()).mul(priceDelta)),
      combineLatestWith(AUSDPrice$),
      map(([profit, AUSDPrice]) => profit.mul(AUSDPrice))
    );
  };
};
