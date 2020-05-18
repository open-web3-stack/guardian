import _ from 'lodash';
import joi from '@hapi/joi';
import { Observable, from } from 'rxjs';
import { switchMap, flatMap, map } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';
import Task from '../Task';

type Result = {
  account: string;
  currencyId: string;
  free: string;
  reserved: string;
  frozen: string;
};

export default class BalancesTask extends Task {
  api$: Observable<ApiRx>;

  validationSchema = joi
    .object({
      account: joi.alt(joi.string(), joi.array().items(joi.string())),
      currencyId: joi.alt(joi.string(), joi.array().items(joi.string())),
    })
    .required();

  constructor(api$: Observable<ApiRx>) {
    super();
    this.api$ = api$;
  }

  call(params: { account: string | string[]; currencyId: string | string[] }): Observable<Result> {
    const { account, currencyId } = this.validateParameters(params);

    return this.api$.pipe(
      switchMap(
        (api): Observable<Result> => {
          const pairs = this.createPairs(account, currencyId);
          return from(pairs).pipe(flatMap(({ account, currencyId }) => this.getBalance(api, account, currencyId)));
        }
      )
    );
  }

  getBalance(api: ApiRx, account: string, currencyId: string): Observable<Result> {
    return api.query.tokens.accounts(currencyId, account).pipe(
      map((result: any) => {
        return {
          account,
          currencyId,
          free: result.free.toString(),
          reserved: result.reserved.toString(),
          frozen: '0', // FIXME:
        };
      })
    );
  }

  createPairs(account: string | string[], currencyId: string | string[]): { account: string; currencyId: string }[] {
    if (typeof account === 'string') {
      account = [account];
    }
    if (typeof currencyId === 'string') {
      currencyId = [currencyId];
    }

    return _.flatMap(account, (account) => _.map(currencyId, (currencyId) => ({ account, currencyId })));
  }
}
