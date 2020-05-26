import _ from 'lodash';
import Joi from '@hapi/joi';
import { from } from 'rxjs';
import { switchMap, flatMap, map } from 'rxjs/operators';
import { AccountInfo } from '@polkadot/types/interfaces';
import SubstrateTask from './SubstrateTask';

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

type Output = {
  account: string;
  nonce: number;
  free: number;
  reserved: number;
  mis_frozen: number;
  fee_froze: number;
};

export default class AccountsTask extends SubstrateTask<Output> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  init(params: { account: string | string[] }) {
    const { account } = params;

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
