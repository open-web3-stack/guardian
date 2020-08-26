import Joi from 'joi';
import _ from 'lodash';
import BN from 'bn.js';
import { TraderInfo } from '@laminar/api';
import { unit } from '@laminar/api/utils';
import Task from '../Task';
import { LaminarGuardian } from '@open-web3/guardian/guardians';
import { autorun$ } from '@open-web3/guardian/utils';
import { computedFn } from 'mobx-utils';
import { StorageType } from '@laminar/types';

const getBalancesFn = (storage: StorageType) =>
  computedFn((account: string, poolId: number | number[] | 'all') => {
    const balances: Record<string, string> = {};
    if (poolId === 'all') {
      const balanceEntries = storage.marginProtocol.balances.entries(account);
      for (const [poolId, balance] of balanceEntries.entries()) {
        balances[poolId] = balance.toString();
      }
    } else {
      const poolIds = _.castArray(poolId);
      for (const id of poolIds) {
        const balance = storage.marginProtocol.balances(account, String(poolId));
        if (balance) {
          balances[id] = balance.toString();
        }
      }
    }
    return balances;
  });

export default class TraderInfoTask extends Task<
  { account: string | string[]; poolId: number | number[] | 'all' },
  TraderInfo
> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')).required(),
    }).required();
  }

  async start(guardian: LaminarGuardian) {
    const { laminarApi, storage } = await guardian.isReady();

    const accounts = _.castArray(this.arguments.account);

    const getBalances = getBalancesFn(storage);

    return autorun$<TraderInfo>((subscriber) => {
      for (const account of accounts) {
        const balances = getBalances(account, this.arguments.poolId);
        for (const [poolId, balance] of Object.entries(balances)) {
          laminarApi.api.rpc.margin
            .traderState(account, laminarApi.api.createType('LiquidityPoolId', poolId))
            .toPromise()
            .then((result) => {
              const equity = result.equity;
              const marginLevel = result.margin_level;
              const unrealizedPl = result.unrealized_pl;
              subscriber.next({
                balance: balance.toString(),
                freeMargin: result.free_margin.toString(),
                marginHeld: result.margin_held.toString(),
                unrealizedPl: unrealizedPl.toString(),
                accumulatedSwap: equity.sub(new BN(balance)).sub(unrealizedPl).toString(),
                equity: equity.toString(),
                marginLevel: marginLevel.toString(),
                totalLeveragedPosition: equity.mul(unit).div(marginLevel).toString(),
              });
            })
            .catch();
        }
      }
    });
  }
}
