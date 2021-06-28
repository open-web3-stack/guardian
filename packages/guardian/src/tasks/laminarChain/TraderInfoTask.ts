import Joi from 'joi';
import _ from 'lodash';
import BN from 'bn.js';
import { timer } from 'rxjs';
import { switchMap, distinctUntilChanged, publishReplay, refCount } from 'rxjs/operators';
import { TraderInfo, LaminarApi } from '@laminar/api';
import { unit } from '@laminar/api/utils';
import { LaminarGuardian } from '@open-web3/guardian/guardians';
import { computedFn, fromStream } from 'mobx-utils';
import { StorageType } from '@laminar/types';
import { RPCRefreshPeriod } from '../../constants';
import { autorun$ } from '../../utils';
import Task from '../Task';

const getBalancesFn = (storage: StorageType) =>
  computedFn((account: string, poolId: number | number[] | 'all') => {
    const balances: Record<string, string> = {};
    if (poolId === 'all') {
      const balanceEntries = storage.marginProtocol.balances.entries(account);
      if (!balanceEntries) return balances;
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

const getTraderState = computedFn((laminarApi: LaminarApi, account: string, poolId: string, period) => {
  const liquidityPoolId = laminarApi.api.createType('LiquidityPoolId', poolId);
  const stream$ = timer(0, period).pipe(
    switchMap(() => laminarApi.api.rpc.margin.traderState(account, liquidityPoolId)),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    publishReplay(1),
    refCount()
  );
  return fromStream(stream$);
});

export default class TraderInfoTask extends Task<
  { account: string | string[]; poolId: number | number[] | 'all'; period: number },
  TraderInfo
> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')).required(),
      period: Joi.number().default(RPCRefreshPeriod)
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
          const result = getTraderState(laminarApi, account, poolId, this.arguments.period);
          if (!result.current) continue;

          const traderState = result.current;

          const equity = traderState.equity;
          const marginLevel = traderState.margin_level;
          const unrealizedPl = traderState.unrealized_pl;

          subscriber.next({
            balance: balance.toString(),
            freeMargin: traderState.free_margin.toString(),
            marginHeld: traderState.margin_held.toString(),
            unrealizedPl: unrealizedPl.toString(),
            accumulatedSwap: equity.sub(new BN(balance)).sub(unrealizedPl).toString(),
            equity: equity.toString(),
            marginLevel: marginLevel.toString(),
            totalLeveragedPosition: equity.mul(unit).div(marginLevel).toString()
          });
        }
      }
    });
  }
}
