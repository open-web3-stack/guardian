import Joi from '@hapi/joi';
import { Observable, from, combineLatest } from 'rxjs';
import { switchMap, map, flatMap, filter } from 'rxjs/operators';
import { DerivedDexPool } from '@acala-network/api-derive';
import { TimestampedValue } from '@open-web3/orml-types/interfaces';
import AcalaTask from './AcalaTask';
import { getValueFromTimestampValue } from '../helpers';
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
            combineLatest([
              api.derive['dex'].pool(currencyId) as Observable<DerivedDexPool>,
              api.derive['price'].price(currencyId) as Observable<TimestampedValue>,
            ]).pipe(
              filter(([, price]) => getValueFromTimestampValue(price).toString().length > 0),
              map(([pool, price]) => {
                return {
                  currencyId,
                  price: getValueFromTimestampValue(price).toString(),
                  baseLiquidity: pool.base.toString(),
                  otherLiquidity: pool.other.toString(),
                };
              })
            )
          )
        );
      })
    );
  }
}
