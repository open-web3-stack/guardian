import Joi from 'joi';
import { castArray } from 'lodash';
import { of, from, combineLatest } from 'rxjs';
import { switchMap, mergeAll, map, filter, mergeMap } from 'rxjs/operators';
import { LaminarGuardian } from '@open-web3/guardian/guardians';
import { Position } from '../../types';
import unrealizedPL from './helpers/unrealizedPL';
import accumulatedSwap from './helpers/accumulatedSwap';
import Task from '../Task';

export default class PositionsByTraderTask extends Task<{ account: string | string[] }, Position> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required()
    }).required();
  }

  async start(guardian: LaminarGuardian) {
    const { apiRx } = await guardian.isReady();

    const accounts = castArray(this.arguments.account);

    const getSwap = accumulatedSwap(apiRx);
    const getUnrealizedPL = unrealizedPL(apiRx);

    return from(accounts).pipe(
      mergeAll(),
      switchMap((account) => apiRx.query.marginProtocol.positionsByTrader.entries(account)),
      mergeAll(),
      filter(([, value]) => !value.isEmpty),
      mergeMap(([storageKey]) => {
        const positionId = storageKey.args[1][1];
        return apiRx.query.marginProtocol.positions(positionId).pipe(
          filter((x) => x.isSome),
          map((x) => x.unwrap()),
          mergeMap((position) => combineLatest([of(position), getSwap(position), getUnrealizedPL(position)])),
          map(([position, swap, profit]) => {
            const { owner, poolId, pair, leverage, marginHeld } = position;
            return {
              account: owner.toString(),
              liquidityPoolId: poolId.toString(),
              positionId: positionId.toString(),
              pair: {
                base: pair.base.toString(),
                quote: pair.quote.toString()
              },
              leverage: leverage.toString(),
              marginHeld: marginHeld.toString(),
              accumulatedSwap: swap ? swap.toFixed(0) : '',
              profit: profit ? profit.toFixed(0) : ''
            };
          })
        );
      })
    );
  }
}
