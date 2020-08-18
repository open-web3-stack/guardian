import Joi from 'joi';
import { Observable, from } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';
import { Balance as ORMLBalance } from '@open-web3/orml-types/interfaces';
import { createAccountCurrencyIdPairs } from '../helpers';
import { Balance } from '../../types';
import Task from '../Task';
import BaseSubstrateGuardian from '../../guardians/BaseSubstrateGuardian';

export default class BalancesTask extends Task<{ account: string | string[]; currencyId: string | string[] }, Balance> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  async start(guardian: BaseSubstrateGuardian) {
    const { apiRx } = await guardian.isReady();

    const { account, currencyId } = this.arguments;

    const pairs = createAccountCurrencyIdPairs(account, currencyId);
    return from(pairs).pipe(flatMap(({ account, currencyId }) => this.getBalance(apiRx, account, currencyId)));
  }

  getBalance(api: ApiRx, account: string, currencyId: string): Observable<Balance> {
    return (api.derive as any).currencies.balance(account, currencyId).pipe(
      map((result: ORMLBalance) => {
        return {
          account,
          currencyId,
          free: result.toString(),
        };
      })
    );
  }
}
