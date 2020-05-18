import _ from 'lodash';
import joi from '@hapi/joi';
import { Observable, from, timer } from 'rxjs';
import { switchMap, flatMap, map } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';
import Task from '../Task';

type Result = {
  key: string;
  value: string;
};

export default class PricesTask extends Task {
  api$: Observable<ApiRx>;

  validationSchema = joi
    .object({
      key: joi.alt(joi.string(), joi.array().items(joi.string())).required(),
      period: joi.number().default(30_000),
    })
    .required();

  constructor(api$: Observable<ApiRx>) {
    super();
    this.api$ = api$;
  }

  call(params: { key: string | string[]; period?: number }) {
    const { key, period } = this.validateParameters(params);

    return this.api$.pipe(
      switchMap((api) => {
        const oracle = api.rpc['oracle'];
        return timer(0, period).pipe(
          switchMap(
            (): Observable<Result> => {
              if (key === 'all') {
                return oracle.getAllValues().pipe(
                  flatMap(
                    (result: any): Observable<Result> => {
                      return from(result).pipe(map(([key, item]) => ({ key, value: item.value.toString() })));
                    }
                  )
                );
              } else if (Array.isArray(key)) {
                return from(key).pipe(
                  flatMap(
                    (key): Observable<Result> =>
                      oracle.getValue(key).pipe(map((output: any) => ({ key, value: output.value.toString() })))
                  )
                );
              }
              return oracle.getValue(key).pipe(map((output: any) => ({ key, value: output.value.toString() })));
            }
          )
        );
      })
    );
  }
}
