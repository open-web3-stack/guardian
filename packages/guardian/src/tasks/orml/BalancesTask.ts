import * as Joi from 'joi';
import { castArray } from 'lodash';
import { Observable, from } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';
import { Codec } from '@polkadot/types/types';
import { Balance as ORMLBalance } from '@open-web3/orml-types/interfaces';
import { createAccountCurrencyIdPairs } from '../utils';
import { Balance } from '../../types';
import Task from '../Task';
import BaseSubstrateGuardian from '../../BaseSubstrateGuardian';

export default class BalancesTask extends Task<{ account: string | string[]; currencyId: any }, Balance> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.any().required()
    }).required();
  }

  async start<T extends BaseSubstrateGuardian>(guardian: T) {
    const { apiRx } = await guardian.isReady();

    const { account, currencyId } = this.arguments;

    const currencyIds = castArray(currencyId).map((x) => apiRx.createType('CurrencyId', x));

    const pairs = createAccountCurrencyIdPairs(account, currencyIds);
    return from(pairs).pipe(mergeMap(({ account, currencyId }) => this.getBalance(apiRx, account, currencyId as any)));
  }

  getBalance<CurrencyId extends Codec>(api: ApiRx, account: string, currencyId: CurrencyId): Observable<Balance> {
    return (api.derive as any).currencies.balance(account, currencyId).pipe(
      map((result: ORMLBalance) => {
        return {
          account,
          currencyId: currencyId.toString(),
          free: result.toString()
        };
      })
    );
  }
}
