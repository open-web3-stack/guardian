import assert from 'assert';
import Joi from 'joi';
import { castArray } from 'lodash';
import { from, lastValueFrom } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { TradingPair } from '@acala-network/types/interfaces';
import { FixedPointNumber } from '@acala-network/sdk-core';

import { Pool } from '../../types';
import Task from '../Task';
import { AcalaGuardian } from '../../guardians';

export default class PoolsTask extends Task<{ currencyId: any }, Pool> {
  validationSchema() {
    return Joi.object({
      currencyId: Joi.any().required()
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx, getTokenPrecision } = await guardian.isReady();

    const { currencyId } = this.arguments;

    const stableCoin = apiRx.consts.cdpEngine.getStableCurrencyId;
    const nativeCoin = apiRx.consts.currencies.getNativeCurrencyId;

    let pairs: TradingPair[];

    if (currencyId === 'all') {
      const tradingPair = await lastValueFrom(apiRx.query.dex.liquidityPool.entries().pipe(take(1)));

      pairs = tradingPair
        .map(([key, value]) => {
          const [balance1, balance2] = value;

          if (balance1 && balance2) {
            return key.args[0];
          }

          return undefined;
        })
        .filter((p): p is TradingPair => p !== undefined);
    } else {
      const currencies = castArray(currencyId);
      pairs = currencies
        .map((x) => apiRx.createType('CurrencyId', x))
        .map((currencyId) => {
          return currencyId.eq(nativeCoin)
            ? apiRx.createType('TradingPair', [currencyId, stableCoin])
            : apiRx.createType('TradingPair', [stableCoin, currencyId]);
        });
    }

    // ignore non-token currency
    // TODO: support any currency
    pairs = pairs.filter(([base, quote]) => {
      return base.isToken && quote.isToken && !base.eq(quote);
    });

    return from(pairs).pipe(
      mergeMap((pair) =>
        apiRx.query.dex.liquidityPool(pair).pipe(
          map(([base, other]) => {
            const [baseCurrency, otherCurrency] = pair;
            const basePrecision = getTokenPrecision(baseCurrency.asToken.toString());
            assert(basePrecision);
            const otherPrecision = getTokenPrecision(otherCurrency.asToken.toString());
            assert(otherPrecision);
            const _base = FixedPointNumber.fromInner(base.toString(), basePrecision);
            const _other = FixedPointNumber.fromInner(other.toString(), otherPrecision);
            const price = baseCurrency.eq(stableCoin) ? _base.div(_other) : _other.div(_base);
            price.setPrecision(18);
            return {
              currencyId: pair.toString(),
              price: price._getInner().toFixed(0),
              baseLiquidity: base.toString(),
              otherLiquidity: other.toString()
            };
          })
        )
      )
    );
  }
}
