import Joi from 'joi';
import { Fixed18 } from '@acala-network/app-util';
import { Pool } from '../../types';
import Task from '../Task';
import { AcalaGuardian } from '../../guardians';
import { autorun$ } from '@open-web3/guardian/utils';

export default class PoolsTask extends Task<{ currencyId: string | string[] }, Pool> {
  validationSchema() {
    return Joi.object({
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx, storage } = await guardian.isReady();

    let { currencyId } = this.arguments;

    const enabledCurrencyIds = apiRx.consts.dex.enabledCurrencyIds.toHuman() as string[];

    if (currencyId === 'all') {
      currencyId = enabledCurrencyIds;
    } else if (typeof currencyId === 'string') {
      currencyId = [currencyId];
    }

    currencyId.forEach((currencyId) => {
      if (!enabledCurrencyIds.includes(currencyId)) throw Error(`${currencyId} is not enabled currencyId`);
    });

    return autorun$<Pool>((subscriber) => {
      for (const token of currencyId) {
        const pool = storage.dex.liquidityPool(token as any);
        if (!pool) continue;

        const [other, base] = pool;
        const price = Fixed18.fromRational(base.toString(), other.toString()).innerToString();

        subscriber.next({
          currencyId: token,
          price,
          baseLiquidity: base.toString(),
          otherLiquidity: other.toString(),
        });
      }
    });
  }
}
