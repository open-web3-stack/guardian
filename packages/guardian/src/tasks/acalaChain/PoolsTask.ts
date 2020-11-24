import Joi from 'joi';
import { TradingPair } from '@acala-network/types/interfaces';
import { Fixed18 } from '@acala-network/app-util';
import { Pool } from '../../types';
import Task from '../Task';
import { AcalaGuardian } from '../../guardians';
import { autorun$ } from '../../utils';

export default class PoolsTask extends Task<{ currencyId: any }, Pool> {
  validationSchema() {
    return Joi.object({
      currencyId: Joi.any().required(),
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx, storage } = await guardian.isReady();

    const { currencyId } = this.arguments;

    let pairs: TradingPair[];

    if (currencyId === 'all') {
      pairs = apiRx.consts.dex.enabledTradingPairs.toArray();
    } else {
      pairs = (Array.isArray(currencyId) ? currencyId : [currencyId]).map(
        (x) => apiRx.createType('TradingPair', { base: { token: 'AUSD', quote: { token: x } } }) as any
      );
    }

    return autorun$<Pool>((subscriber) => {
      for (const pair of pairs) {
        const pool = storage.dex.liquidityPool(pair.toHex() as any);
        if (!pool) continue;

        const [other, base] = pool;
        const price = Fixed18.fromRational(base.toString(), other.toString()).innerToString();

        subscriber.next({
          currencyId: pair.toString(),
          price,
          baseLiquidity: base.toString(),
          otherLiquidity: other.toString(),
        });
      }
    });
  }
}
