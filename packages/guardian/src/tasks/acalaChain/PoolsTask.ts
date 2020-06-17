import Joi from '@hapi/joi';
import { Observable, from } from 'rxjs';
import { switchMap, map, flatMap } from 'rxjs/operators';
import { DerivedDexPool } from '@acala-network/api-derive';
import { Fixed18 } from '@acala-network/app-util';
import AcalaTask from './AcalaTask';
import { Pool } from '../../types';

export default class PoolsTask extends AcalaTask<Pool> {
  validationSchema() {
    return Joi.object({
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  init(params: { currencyId: string | string[] }) {
    let { currencyId } = params;

    return this.api$.pipe(
      switchMap((api) => {
        // constants
        const enabledCurrencyIds = api.consts.dex.enabledCurrencyIds.toHuman() as string[];

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
            (api.derive['dex'].pool(currencyId) as Observable<DerivedDexPool>).pipe(
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
      })
    );
  }
}
