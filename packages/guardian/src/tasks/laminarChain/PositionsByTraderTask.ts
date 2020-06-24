import Joi from '@hapi/joi';
import { from } from 'rxjs';
import { switchMap, flatMap, map, filter, concatAll } from 'rxjs/operators';
import LaminarTask from './LaminarTask';
import { Position } from '../../types';
import { isNonNull } from '../helpers';
export default class PositionsByTraderTask extends LaminarTask<Position> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  init(params: { account: string | string[] }) {
    const { account } = params;

    return this.chainApi$.pipe(
      switchMap((laminarApi) =>
        from(Array.isArray(account) ? account : [account]).pipe(
          flatMap((account) =>
            laminarApi.margin.positionsByTrader(account).pipe(
              concatAll(),
              flatMap(({ positionId }) =>
                laminarApi.margin.position(positionId).pipe(
                  filter(isNonNull),
                  map((position) => {
                    const { poolId: liquidityPoolId, pair, leverage, marginHeld, openAccumulatedSwapRate } = position;
                    return {
                      account,
                      liquidityPoolId,
                      positionId,
                      pair,
                      leverage,
                      marginHeld,
                      accumulatedSwap: String(openAccumulatedSwapRate),
                      profit: '-', // TODO:
                    };
                  })
                )
              )
            )
          )
        )
      )
    );
  }
}
