import _ from 'lodash';
import Joi from '@hapi/joi';
import { from } from 'rxjs';
import { switchMap, flatMap } from 'rxjs/operators';
import { TraderInfo } from '@laminar/api';
import LaminarTask from './LaminarTask';

export default class TraderInfoTask extends LaminarTask<TraderInfo> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  init(params: { account: string | string[] }) {
    const { account } = params;

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
