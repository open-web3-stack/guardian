import Joi from '@hapi/joi';
import { Observable, from } from 'rxjs';
import { switchMap, flatMap, map, filter, distinctUntilChanged } from 'rxjs/operators';
import { Codec, ITuple } from '@polkadot/types/types';
import { Option, Vec } from '@polkadot/types/codec';
import { TimestampedValue } from '@open-web3/orml-types/interfaces';
import SubstrateTask from '../substrate/SubstrateTask';
import { getValueFromTimestampValue, observeRPC } from '../helpers';
import { Price } from '../../types';

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
        if (key === 'all') {
          return observeRPC<Vec<ITuple<[Codec, Option<TimestampedValue>]>>>(
            api.rpc['oracle'].getAllValues,
            [],
            period
          ).pipe(
            flatMap(
              (result): Observable<Price> => {
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
        }

        return from(Array.isArray(key) ? key : [key]).pipe(
          flatMap((key) =>
            observeRPC<Option<TimestampedValue>>(api.rpc['oracle'].getValue, [key], period).pipe(
              filter((output: Option<TimestampedValue>) => output.isSome),
              map((output: Option<TimestampedValue>) => output.unwrap()),
              map((output: TimestampedValue) => ({
                key,
                value: getValueFromTimestampValue(output).toString(),
              }))
            )
          )
        );
      }),
      distinctUntilChanged((a, b) => JSON.stringify(a) !== JSON.stringify(b)),
      filter((price) => price.value.length > 0)
    );
  }
}
