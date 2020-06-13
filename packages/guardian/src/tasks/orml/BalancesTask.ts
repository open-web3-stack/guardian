import BN from 'bn.js';
import Joi from '@hapi/joi';
import { Observable, from } from 'rxjs';
import { switchMap, flatMap, map } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';
import SubstrateTask from '../substrate/SubstrateTask';
import { createAccountCurrencyIdPairs } from '../helpers';
import { Balance } from '../../types';

export default class BalancesTask extends SubstrateTask<Balance> {
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
        (api): Observable<Balance> => {
          const pairs = createAccountCurrencyIdPairs(account, currencyId);
          return from(pairs).pipe(flatMap(({ account, currencyId }) => this.getBalance(api, account, currencyId)));
        }
      )
    );
  }

  getBalance(api: ApiRx, account: string, currencyId: string): Observable<Balance> {
    const key1 = api.query.tokens.accounts.creator.meta.type.asDoubleMap.key1.toString();
    const arg = key1 === 'CurrencyId' ? [currencyId, account] : [account, currencyId];
    return api.query.tokens.accounts(...arg).pipe(
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
