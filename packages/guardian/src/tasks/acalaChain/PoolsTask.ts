import Joi from 'joi';
import { Observable, from } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { DerivedDexPool } from '@acala-network/api-derive';
import { Fixed18 } from '@acala-network/app-util';
import { Pool } from '../../types';
import Task from '../Task';
import { AcalaGuardian } from '../../guardians';

export default class PoolsTask extends Task<{ currencyId: string | string[] }, Pool> {
  validationSchema() {
    return Joi.object({
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx } = await guardian.isReady();

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

    return from(currencyId).pipe(
      flatMap((currencyId) =>
        ((apiRx.derive as any).dex.pool(currencyId) as Observable<DerivedDexPool>).pipe(
          map((pool) => {
            const baseLiquidity = pool.base.toString();
            const otherLiquidity = pool.other.toString();

            const price = Fixed18.fromRational(baseLiquidity, otherLiquidity).innerToString();

            return {
              currencyId,
              price,
              baseLiquidity,
              otherLiquidity,
            };
          })
        )
      )
    );
  }
}
