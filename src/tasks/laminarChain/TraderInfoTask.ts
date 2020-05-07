import _ from 'lodash';
import joi from '@hapi/joi';
import { from } from 'rxjs';
import { switchMap, flatMap } from 'rxjs/operators';
import LaminarTask from './LaminarTask';

export default class TraderInfoTask extends LaminarTask {
  validationSchema = joi
    .object({
      account: joi.alt(joi.string(), joi.array().items(joi.string())),
    })
    .required();

  call(params: { account: string | string[] }) {
    const { account } = this.validateParameters(params);

    return this.chainApi$.pipe(
      switchMap((laminarApi) => {
        if (_.isArray(account)) {
          return from(account).pipe(flatMap((account) => laminarApi.margin.traderInfo(account, '0')));
        }
        return laminarApi.margin.traderInfo(account, '0');
      })
    );
  }
}
