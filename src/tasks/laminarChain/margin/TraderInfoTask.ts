import _ from 'lodash';
import joi from '@hapi/joi';
import { Observable, from } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { laminarApi$ } from '../laminarApi';
import Task from '../../Task';

type MarginTraderInfo = {
  equity: string;
  freeMargin: string;
  marginHeld: string;
  marginLevel: string;
  unrealizedPl: string;
};

export default class TraderInfo extends Task {
  validationSchema = joi
    .object({
      account: joi.alt(joi.string(), joi.array().items(joi.string())),
    })
    .required();

  call(params: { account: string | string[] }): Observable<MarginTraderInfo> {
    const { account } = this.validateParameters(params);

    return laminarApi$.pipe(
      flatMap((laminarApi) => {
        if (_.isArray(account)) {
          return from(account).pipe(flatMap((account) => laminarApi.margin.traderInfo(account)));
        }
        return laminarApi.margin.traderInfo(account);
      })
    );
  }
}
