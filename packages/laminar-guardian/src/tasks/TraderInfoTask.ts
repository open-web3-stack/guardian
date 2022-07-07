import * as Joi from 'joi';
import { castArray } from 'lodash';
import BN from 'bn.js';
import { timer, from } from 'rxjs';
import { switchMap, map, mergeMap, distinctUntilChanged, share } from 'rxjs/operators';
import { TraderInfo } from '@laminar/api';
import { unit } from '@laminar/api/utils';
import { Task } from '@open-web3/guardian';
import { RPCRefreshPeriod } from '../constants';
import { ApiRx } from '@polkadot/api';
import { AccountId } from '@open-web3/orml-types/interfaces';
import { LiquidityPoolId } from '@laminar/types/interfaces';
import LaminarGuardian from '../LaminarGuardian';

const getBalances = (apiRx: ApiRx) => (account: string, poolId: number | number[] | 'all') => {
  return apiRx.query.marginProtocol.balances.entries(account).pipe(
    mergeMap((entries) =>
      entries.filter(([storageKey]) => {
        if (poolId === 'all') return true;
        const [, id] = storageKey.args;
        return castArray(poolId).includes(id.toNumber());
      })
    )
  );
};

const getTraderState = (apiRx: ApiRx, account: AccountId, poolId: LiquidityPoolId, period: number) => {
  const liquidityPoolId = apiRx.createType('LiquidityPoolId', poolId);
  return timer(0, period).pipe(
    switchMap(() => apiRx.rpc.margin.traderState(account, liquidityPoolId)),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    share()
  );
};

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
    const { apiRx } = await guardian.isReady();

    const accounts = castArray(this.arguments.account);

    const getBalances$ = getBalances(apiRx);

    return from(accounts).pipe(
      switchMap((account) => {
        return getBalances$(account, this.arguments.poolId).pipe(
          mergeMap(([storageKey, balance]) => {
            const [account, poolId] = storageKey.args;
            return getTraderState(apiRx, account, poolId, this.arguments.period).pipe(
              map(
                ({
                  equity,
                  unrealized_pl: unrealizedPL,
                  margin_level: marginLevel,
                  margin_held: marginHeld,
                  free_margin: freeMargin
                }) => {
                  return {
                    balance: balance.toString(),
                    freeMargin: freeMargin.toString(),
                    marginHeld: marginHeld.toString(),
                    unrealizedPl: unrealizedPL.toString(),
                    accumulatedSwap: equity.sub(new BN(balance)).sub(unrealizedPL).toString(),
                    equity: equity.toString(),
                    marginLevel: marginLevel.toString(),
                    totalLeveragedPosition: equity.mul(unit).div(marginLevel).toString()
                  };
                }
              )
            );
          })
        );
      })
    );
  }
}
