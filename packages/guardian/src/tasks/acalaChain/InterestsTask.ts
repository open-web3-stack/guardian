import Joi from '@hapi/joi';
import { from } from 'rxjs';
import { switchMap, map, flatMap } from 'rxjs/operators';
import AcalaTask from './AcalaTask';
import { createAccountCurrencyIdPairs } from '../helpers';
import { Interest } from '../../types';

export default class InterestsTask extends AcalaTask<Interest> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  init(params: { account: string | string[]; currencyId: string | string[] }) {
    const { account } = params;
    let { currencyId } = params;

    return this.api$.pipe(
      switchMap((api) => {
        // constants
        const enabledCurrencyIds = api.consts.dex.enabledCurrencyIds.toHuman() as string[];

        // validate currency id
        if (currencyId === 'all') {
          currencyId = enabledCurrencyIds;
        } else if (typeof currencyId === 'string') {
          currencyId = [currencyId];
        }

        currencyId.forEach((currencyId) => {
          if (!enabledCurrencyIds.includes(currencyId)) throw Error(`${currencyId} is not enabled currencyId`);
        });

        // create {account, currencyId} paris
        const pairs = createAccountCurrencyIdPairs(account, currencyId);

        // setup stream
        return from(pairs).pipe(
          flatMap(({ account, currencyId }) =>
            api.query.dex.withdrawnInterest(currencyId, account).pipe(
              map((result) => {
                return {
                  account,
                  currencyId,
                  interests: result.toString(),
                };
              })
            )
          )
        );
      })
    );
  }
}
