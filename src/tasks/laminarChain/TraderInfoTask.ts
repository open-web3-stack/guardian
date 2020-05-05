import _ from 'lodash';
import joi from '@hapi/joi';
import { Observable, from } from 'rxjs';
import { switchMap, flatMap } from 'rxjs/operators';
import LaminarTask from './LaminarTask';

type MarginTraderInfo = {
  equity: string;
  freeMargin: string;
  marginHeld: string;
  marginLevel: string;
  unrealizedPl: string;
};

export default class TraderInfoTask extends LaminarTask {
  validationSchema = joi
    .object({
      account: joi.alt(joi.string(), joi.array().items(joi.string())),
    })
    .required();

  call(params: { account: string | string[] }): Observable<MarginTraderInfo> {
    const { account } = this.validateParameters(params);

    return this.chainApi$.pipe(
      switchMap((laminarApi) => {
        if (_.isArray(account)) {
          return from(account).pipe(flatMap((account) => laminarApi.margin.traderInfo(account)));
        }
        return laminarApi.margin.traderInfo(account);
      })
    );
  }
}
