import _ from 'lodash';
import joi from '@hapi/joi';
import { Observable, from } from 'rxjs';
import { switchMap, flatMap } from 'rxjs/operators';
import { AnyJson } from '@polkadot/types/types';
import LaminarTask from './LaminarTask';

export default class PositionsByTraderTask extends LaminarTask {
  validatationSchema = joi
    .object({
      account: joi.alt(joi.string(), joi.array().items(joi.string())),
    })
    .required();

  call(params: { account: string | string[] }): Observable<AnyJson> {
    const { account } = this.validateParameters(params);

    return this.chainApi$.pipe(
      switchMap((laminarApi) => {
        // map multiple accounts
        if (_.isArray(account)) {
          return from(account).pipe(
            flatMap((account: string) => laminarApi.margin.positionsByTrader(account)),
            flatMap((positions) => positions),
            flatMap(({ positionId }) => laminarApi.margin.positions(positionId))
          );
        }
        // map single account
        return laminarApi.margin.positionsByTrader(account).pipe(
          flatMap((positions) => positions),
          flatMap(({ positionId }) => laminarApi.margin.positions(positionId))
        );
      })
    );
  }
}
