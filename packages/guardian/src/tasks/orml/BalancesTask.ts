import Joi from 'joi';
import { Observable, from } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';
import { Codec } from '@polkadot/types/types';
import { Balance as ORMLBalance } from '@open-web3/orml-types/interfaces';
import { createAccountCurrencyIdPairs } from '../helpers';
import { Balance } from '../../types';
import Task from '../Task';
import BaseSubstrateGuardian from '../../guardians/BaseSubstrateGuardian';

export default class BalancesTask extends Task<{ account: string | string[]; currencyId: any }, Balance> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.any().required(),
    }).required();
  }

  async start(guardian: BaseSubstrateGuardian) {
    const { apiRx } = await guardian.isReady();

    const { account, currencyId } = this.arguments;

    const currencyIds = (Array.isArray(currencyId) ? currencyId : [currencyId]).map((x) =>
      apiRx.createType('CurrencyId', x)
    );

    const pairs = createAccountCurrencyIdPairs(account, currencyIds);
    return from(pairs).pipe(flatMap(({ account, currencyId }) => this.getBalance(apiRx, account, currencyId)));
  }

  getBalance<CurrencyId extends Codec>(api: ApiRx, account: string, currencyId: CurrencyId): Observable<Balance> {
    return (api.derive as any).currencies.balance(account, currencyId).pipe(
      map((result: ORMLBalance) => {
        return {
          account,
          currencyId: currencyId.toString(),
          free: result.toString(),
        };
      })
    );
  }
}
