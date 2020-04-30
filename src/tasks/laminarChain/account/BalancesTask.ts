import _ from 'lodash';
import joi from '@hapi/joi';
import { Observable, from } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { laminarApi$ } from '../laminarApi';
import Task from '../../Task';

type Result = {
  account: string;
  currencyId: string;
  free: number;
  reserved: number;
  frozen: number;
};

export default class BalancesTask extends Task {
  validationSchema = joi
    .object({
      account: joi.alt(joi.string(), joi.array().items(joi.string())),
      currencyId: joi.any(),
    })
    .required();

  // TODO: implement desired output
  call(params: { account: string | string[] }): Observable<any> {
    const { account } = this.validateParameters(params);

    return laminarApi$.pipe(
      flatMap((laminarApi) => {
        if (_.isArray(account)) {
          return from(account).pipe(flatMap((id) => laminarApi.balances(id)));
        }
        return laminarApi.balances(account);
      })
    );
  }
}
