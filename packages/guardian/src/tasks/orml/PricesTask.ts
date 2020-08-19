import Joi from 'joi';
import { Observable, from } from 'rxjs';
import { flatMap, map, filter, distinctUntilChanged } from 'rxjs/operators';
import { Codec, ITuple } from '@polkadot/types/types';
import { Option, Vec } from '@polkadot/types/codec';
import { TimestampedValue } from '@open-web3/orml-types/interfaces';
import { getValueFromTimestampValue, observeRPC, getOraclePrice } from '../helpers';
import { Price } from '../../types';
import Task from '../Task';
import BaseSubstrateGuardian from '../../guardians/BaseSubstrateGuardian';

export default class PricesTask extends Task<{ key: string | string[]; period?: number }, Price> {
  validationSchema() {
    return Joi.object({
      key: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      period: Joi.number().default(30_000),
    }).required();
  }

  async start(guardian: BaseSubstrateGuardian) {
    const { apiRx } = await guardian.isReady();

    const { key, period } = this.arguments;

    if (key === 'all') {
      return observeRPC<Vec<ITuple<[Codec, Option<TimestampedValue>]>>>(
        (apiRx.rpc as any).oracle.getAllValues,
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
        from(getOraclePrice(apiRx, period)(key)).pipe(map((price) => ({ key, value: price.toFixed(0) })))
      ),
      distinctUntilChanged((a, b) => JSON.stringify(a) !== JSON.stringify(b)),
      filter((price) => price.value.length > 0)
    );
  }
}
