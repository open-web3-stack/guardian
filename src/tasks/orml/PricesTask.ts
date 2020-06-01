import Joi from '@hapi/joi';
import { Observable, from, timer } from 'rxjs';
import { switchMap, flatMap, map, filter } from 'rxjs/operators';
import { Codec, ITuple } from '@polkadot/types/types';
import { Option, Vec } from '@polkadot/types/codec';
import { TimestampedValue } from '@open-web3/orml-types/interfaces';
import SubstrateTask from '../substrate/SubstrateTask';
import { getValueFromTimestampValue } from '../helpers';

export type Price = {
  key: string;
  value: string;
};
export default class PricesTask extends SubstrateTask<Price> {
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
            (): Observable<Price> => {
              if (key === 'all') {
                return oracle.getAllValues().pipe(
                  flatMap(
                    (result: Vec<ITuple<[Codec, Option<TimestampedValue>]>>): Observable<Price> => {
                      return from(result).pipe(
                        filter(([, item]) => item.isSome),
                        map(([key, item]) => ({
                          key: key.toString(),
                          value: getValueFromTimestampValue(item.unwrap()).toString(),
                        }))
                      );
                    }
                  )
                );
              } else if (Array.isArray(key)) {
                return from(key).pipe(
                  flatMap(
                    (key): Observable<Price> =>
                      oracle.getValue(key).pipe(
                        filter((output: Option<TimestampedValue>) => output.isSome),
                        map((output: Option<TimestampedValue>) => output.unwrap()),
                        map((output: TimestampedValue) => ({
                          key,
                          value: getValueFromTimestampValue(output).toString(),
                        }))
                      )
                  )
                );
              }
              return oracle.getValue(key).pipe(
                filter((output: Option<TimestampedValue>) => output.isSome),
                map((output: Option<TimestampedValue>) => output.unwrap()),
                map((output: TimestampedValue) => ({ key, value: getValueFromTimestampValue(output).toString() }))
              );
            }
          ),
          filter((price) => price.value.length > 0)
        );
      })
    );
  }
}
