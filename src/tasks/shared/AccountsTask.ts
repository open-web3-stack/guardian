import _ from 'lodash';
import joi from '@hapi/joi';
import { Observable, from } from 'rxjs';
import { switchMap, flatMap, map } from 'rxjs/operators';
import Task from '../Task';
import { LaminarApi } from '@laminar/api';
import { AccountInfo } from '@polkadot/types/interfaces';

type Output = {
  account: string;
  nonce: number;
  free: number;
  reserved: number;
  mis_frozen: number;
  fee_froze: number;
};

export default class AccountsTask extends Task {
  api$: Observable<LaminarApi['api']>;

  validationSchema = joi
    .object({
      account: joi.alt(joi.string(), joi.array().items(joi.string())),
    })
    .required();

  constructor(api$: Observable<LaminarApi['api']>) {
    super();
    this.api$ = api$;
  }

  call(params: { account: string | string[] }): Observable<Output> {
    const { account } = this.validateParameters(params);

    return this.api$.pipe(
      switchMap((api) => {
        if (_.isArray(account)) {
          return from(account).pipe(
            flatMap((account) => api.query.system.account(account).pipe(map(mapResult(account))))
          );
        }
        return api.query.system.account(account).pipe(map(mapResult(account)));
      })
    );
  }
}

const mapResult = (account: string) => (info: AccountInfo): Output => {
  const output: Output = {
    account: account,
    nonce: info.nonce.toNumber(),
    free: info.data.free.toNumber(),
    reserved: info.data.reserved.toNumber(),
    mis_frozen: info.data.miscFrozen.toNumber(),
    fee_froze: info.data.feeFrozen.toNumber(),
  };
  return output;
};
