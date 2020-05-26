import Joi from '@hapi/joi';
import { Observable, from, timer } from 'rxjs';
import { switchMap, flatMap, map } from 'rxjs/operators';
import SubstrateTask from '../substrate/SubstrateTask';

export type Output = {
  key: string;
  value: string;
};

export default class PricesTask extends SubstrateTask<Output> {
  validationSchema() {
    return Joi.object({
      key: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      period: Joi.number().default(30_000),
    }).required();
  }

  init(params: { key: string | string[]; period?: number }) {
    const { key, period } = params;

    return this.api$.pipe(
      switchMap((api) => {
        const oracle = api.rpc['oracle'];
        return timer(0, period).pipe(
          switchMap(
            (): Observable<Output> => {
              if (key === 'all') {
                return oracle.getAllValues().pipe(
                  flatMap(
                    (result: any): Observable<Output> => {
                      return from(result).pipe(map(([key, item]) => ({ key, value: item.value.toString() })));
                    }
                  )
                );
              } else if (Array.isArray(key)) {
                return from(key).pipe(
                  flatMap(
                    (key): Observable<Output> =>
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
