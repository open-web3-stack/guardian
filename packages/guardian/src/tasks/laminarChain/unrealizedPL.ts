import Big from 'big.js';
import { Observable, of, combineLatest } from 'rxjs';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import { MarginPosition, LaminarApi } from '@laminar/api';
import { MarginPoolTradingPairOption } from '@laminar/types/interfaces';
import { isNonNull } from '../helpers';

type Pair = { base: string; quote: string };

const ONE = Big(1e18);

export default (api: LaminarApi) => (position: MarginPosition): Observable<Big> => {
  const getPairOptions = (poolId: string, pair: Pair) => {
    return api.api.query.marginLiquidityPools.poolTradingPairOptions(poolId, pair) as Observable<
      MarginPoolTradingPairOption
    >;
  };

  const getAskSpread = (poolId: string, pair: Pair) => {
    return getPairOptions(poolId, pair).pipe(
      map(({ askSpread }) => (askSpread.isEmpty ? Big(0) : Big(askSpread.toString())))
    );
  };

  const getBidSpread = (poolId: string, pair: Pair) => {
    return getPairOptions(poolId, pair).pipe(
      map(({ bidSpread }) => (bidSpread.isEmpty ? Big(0) : Big(bidSpread.toString())))
    );
  };

  const price = (tokenId: string) => {
    if (tokenId === 'AUSD') return of(ONE);

    return api.currencies.oracleValues().pipe(
      map((prices) => prices.find((i) => i.tokenId === tokenId)),
      filter(isNonNull),
      map((i) => Big(i.value)),
      distinctUntilChanged()
    );
  };

  const getPrice = (pair: Pair) => {
    return combineLatest([price(pair.base), price(pair.quote)]).pipe(map(([base, quote]) => base.div(quote)));
  };

  const getBidPrice = (poolId: string, pair: Pair) => {
    return combineLatest([getPrice(pair), getBidSpread(poolId, pair)]).pipe(
      map(([price, spread]) => price.sub(spread.div(ONE)))
    );
  };

  const getAskPrice = (poolId: string, pair: Pair) => {
    return combineLatest([getPrice(pair), getAskSpread(poolId, pair)]).pipe(
      map(([price, spread]) => price.add(spread.div(ONE)))
    );
  };

  const { poolId, pair, leveragedDebits, leveragedHeld, leverage } = position;

  const openPrice = Big(leveragedDebits).div(Big(leveragedHeld)).abs();

  let currentPrice: Observable<Big>;
  if (leverage.startsWith('Long')) {
    currentPrice = getAskPrice(poolId, pair);
  } else {
    currentPrice = getBidPrice(poolId, pair);
  }

  return combineLatest([currentPrice, getPrice({ base: pair.quote, quote: 'AUSD' })]).pipe(
    map(([currentPrice, AUSDPrice]) => {
      const priceDelta = currentPrice.sub(openPrice);
      const profit = Big(leveragedHeld).mul(priceDelta);
      // profit in AUSD
      return profit.mul(AUSDPrice);
    })
  );
};
