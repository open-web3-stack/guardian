import assert from 'assert';
import Joi from 'joi';
import { TradingPair } from '@acala-network/types/interfaces';
import { FixedPointNumber } from '@acala-network/sdk-core';
import { lastValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { Pool } from '../../types';
import Task from '../Task';
import { AcalaGuardian } from '../../guardians';
import { autorun$ } from '../../utils';

export default class PoolsTask extends Task<{ currencyId: any }, Pool> {
  validationSchema() {
    return Joi.object({
      currencyId: Joi.any().required()
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx, storage, getTokenPrecision } = await guardian.isReady();

    const { currencyId } = this.arguments;

    const stableCoin = apiRx.consts.cdpEngine.getStableCurrencyId;

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
      pairs = (Array.isArray(currencyId) ? currencyId : [currencyId]).map((x) => {
        const newPair =
          x === 'ACA' || x === 'KAR'
            ? (apiRx.createType('TradingPair', [{ token: x }, stableCoin]) as any)
            : (apiRx.createType('TradingPair', [stableCoin, { token: x }]) as any);

        return newPair;
      });
    }

    return autorun$<Pool>((subscriber) => {
      for (const pair of pairs) {
        const pool = storage.dex.liquidityPool(pair.toHex() as any);
        if (!pool) continue;

        const [baseCurrency, otherCurrency] = pair;
        const [base, other] = pool;
        const basePrecision = getTokenPrecision(baseCurrency.asToken.toString());
        assert(basePrecision);
        const otherPrecision = getTokenPrecision(otherCurrency.asToken.toString());
        assert(otherPrecision);
        const _base = FixedPointNumber.fromInner(base.toString(), basePrecision);
        const _other = FixedPointNumber.fromInner(other.toString(), otherPrecision);
        const price = baseCurrency.eq(stableCoin) ? _base.div(_other) : _other.div(_base);
        price.setPrecision(18);
        subscriber.next({
          currencyId: pair.toString(),
          price: price._getInner().toString(),
          baseLiquidity: base.toString(),
          otherLiquidity: other.toString()
        });
      }
    });
  }
}
