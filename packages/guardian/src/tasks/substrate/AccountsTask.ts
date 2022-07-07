import * as Joi from 'joi';
import { from } from 'rxjs';
import { castArray } from 'lodash';
import { mergeMap, map } from 'rxjs/operators';
import { AccountInfo } from '@polkadot/types/interfaces';
import Task from '../Task';
import BaseSubstrateGuardian from '../../guardians/BaseSubstrateGuardian';

type Output = {
  account: string;
  nonce: number;
  free: number;
  reserved: number;
  misFrozen: number;
  feeFroze: number;
};

const mapResult =
  (account: string) =>
  (info: AccountInfo): Output => {
    return {
      account: account,
      nonce: info.nonce.toNumber(),
      free: info.data.free.toNumber(),
      reserved: info.data.reserved.toNumber(),
      misFrozen: info.data.miscFrozen.toNumber(),
      feeFroze: info.data.feeFrozen.toNumber()
    };
  };

export default class AccountsTask extends Task<{ account: string | string[] }, Output> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required()
    }).required();
  }

  async start<T extends BaseSubstrateGuardian>(guardian: T) {
    const { apiRx } = await guardian.isReady();

    const { account } = this.arguments;

    return from(castArray(account)).pipe(
      mergeMap((account) => apiRx.query.system.account(account).pipe(map(mapResult(account))))
    );
  }
}
