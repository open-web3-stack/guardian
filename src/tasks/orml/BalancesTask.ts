import BN from 'bn.js';
import Joi from '@hapi/joi';
import { Observable, from } from 'rxjs';
import { switchMap, flatMap, map } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';
import { AccountData } from '@polkadot/types/interfaces';
import SubstrateTask from '../substrate/SubstrateTask';
import { createAccountCurrencyIdPairs } from '../helpers';

export type Output = {
  account: string;
  currencyId: string;
  free: string;
  reserved: string;
  frozen: string;
};

export default class BalancesTask extends SubstrateTask<Output> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  init(params: { account: string | string[]; currencyId: string | string[] }) {
    const { account, currencyId } = params;

    return this.api$.pipe(
      switchMap(
        (api): Observable<Output> => {
          const pairs = createAccountCurrencyIdPairs(account, currencyId);
          return from(pairs).pipe(flatMap(({ account, currencyId }) => this.getBalance(api, account, currencyId)));
        }
      )
    );
  }

  getBalance(api: ApiRx, account: string, currencyId: string): Observable<Output> {
    return api.query.tokens.accounts(account, currencyId).pipe(
      map((result: any) => {
        return {
          account,
          currencyId,
          free: result.free.toString(),
          reserved: result.reserved.toString(),
          frozen: result.frozen ? result.frozen.toString() : BN.max(result.feeFrozen, result.miscFrozen).toString(),
        };
      })
    );
  }
}
