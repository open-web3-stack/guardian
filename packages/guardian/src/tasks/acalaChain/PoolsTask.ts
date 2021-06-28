import Joi from 'joi';
import { TradingPair } from '@acala-network/types/interfaces';
import { take } from 'rxjs/operators';
import { Pool } from '../../types';
import Task from '../Task';
import { AcalaGuardian } from '../../guardians';
import { autorun$, tokenPrecision } from '../../utils';
import { FixedPointNumber } from '@acala-network/sdk-core';

export default class PoolsTask extends Task<{ currencyId: any }, Pool> {
  validationSchema() {
    return Joi.object({
      currencyId: Joi.any().required()
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx, storage } = await guardian.isReady();

    const { currencyId } = this.arguments;

    let pairs: TradingPair[];

    if (currencyId === 'all') {
      const tradingPair = await apiRx.query.dex.liquidityPool.entries().pipe(take(1)).toPromise();

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
          x !== 'ACA'
            ? (apiRx.createType('TradingPair', [{ token: 'AUSD' }, { token: x }]) as any)
            : (apiRx.createType('TradingPair', [{ token: x }, { token: 'AUSD' }]) as any);

        return newPair;
      });
    }

    return autorun$<Pool>((subscriber) => {
      for (const pair of pairs) {
        const pool = storage.dex.liquidityPool(pair.toHex() as any);
        if (!pool) continue;

        const [baseCurrency, otherCurrency] = pair;
        const [base, other] = pool;
        const _other = FixedPointNumber.fromInner(other.toString(), tokenPrecision(baseCurrency.asToken.toString()));
        const _base = FixedPointNumber.fromInner(base.toString(), tokenPrecision(otherCurrency.asToken.toString()));
        const price = _other.div(_base);
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
