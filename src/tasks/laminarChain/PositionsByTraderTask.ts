import { get, isArray, isNil } from 'lodash';
import Joi from '@hapi/joi';
import { from, Observable } from 'rxjs';
import { switchMap, flatMap } from 'rxjs/operators';
import { LaminarApi } from '@laminar/api';
import LaminarTask from './LaminarTask';

const getPosition = (laminarApi: LaminarApi, positionId: any): Observable<any> => {
  const method = get(laminarApi.api.query, 'margin.positioins');
  if (isNil(method)) throw Error('api.query.margin.positions not found');
  return method.call(null, positionId);
};

export default class PositionsByTraderTask extends LaminarTask<any> {
  validationSchema = Joi.object({
    account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
  }).required();

  init(params: { account: string | string[] }) {
    const { account } = params;

    return this.chainApi$.pipe(
      switchMap((laminarApi) => {
        // map multiple accounts
        if (isArray(account)) {
          return from(account).pipe(
            flatMap((account: string) => laminarApi.margin.positionsByTrader(account)),
            flatMap((positions) => positions),
            flatMap(({ positionId }) => getPosition(laminarApi, positionId))
          );
        }
        // map single account
        return laminarApi.margin.positionsByTrader(account).pipe(
          flatMap((positions) => positions),
          flatMap(({ positionId }) => getPosition(laminarApi, positionId))
        );
      })
    );
  }
}
