import Joi from '@hapi/joi';
import { Observable, from, combineLatest } from 'rxjs';
import { switchMap, flatMap, map, filter, concatAll } from 'rxjs/operators';
import { MarginPosition, LaminarApi } from '@laminar/api';
import LaminarTask from './LaminarTask';
import { Position } from '../../types';
import { isNonNull } from '../helpers';
import unrealizedPL from './unrealizedPL';
import accumulatedSwap from './accumulatedSwap';

const mapPosition = (
  api: LaminarApi,
  account: string,
  positionId: string,
  position: MarginPosition
): Observable<Position> => {
  const { poolId: liquidityPoolId, pair, leverage, marginHeld } = position;

  return combineLatest([accumulatedSwap(api)(position), unrealizedPL(api)(position)]).pipe(
    map(([accumulatedSwap, unrealized]) => ({
      account,
      liquidityPoolId,
      positionId,
      pair,
      leverage,
      marginHeld,
      accumulatedSwap: accumulatedSwap.toFixed(0),
      profit: unrealized.toFixed(0),
    }))
  );
};

export default class PositionsByTraderTask extends LaminarTask<Position> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  init(params: { account: string | string[] }) {
    const { account } = params;

    const accounts$ = from(Array.isArray(account) ? account : [account]);

    return this.chainApi$.pipe(
      switchMap((laminarApi) =>
        accounts$.pipe(
          flatMap((account) =>
            laminarApi.margin.positionsByTrader(account).pipe(
              concatAll(),
              flatMap(({ positionId }) =>
                laminarApi.margin.position(positionId).pipe(
                  filter(isNonNull),
                  flatMap((position) => mapPosition(laminarApi, account, positionId, position))
                )
              )
            )
          )
        )
      )
    );
  }
}
