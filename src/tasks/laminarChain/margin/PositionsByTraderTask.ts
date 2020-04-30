import _ from 'lodash';
import joi from '@hapi/joi';
import { Observable, from } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { AnyJson } from '@polkadot/types/types';
import { laminarApi$ } from '../laminarApi';
import Task from '../../Task';

export default class PositionsByTraderTask extends Task {
  validatationSchema = joi
    .object({
      account: joi.alt(joi.string(), joi.array().items(joi.string())),
    })
    .required();

  call(params: { account: string | string[] }): Observable<AnyJson> {
    const { account } = this.validateParameters(params);

    return laminarApi$.pipe(
      flatMap((laminarApi) => {
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
