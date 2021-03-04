import Joi from 'joi';
import { Observable, from } from 'rxjs';
import { mergeMap, map, filter } from 'rxjs/operators';
import { Codec, ITuple } from '@polkadot/types/types';
import { Option, Vec } from '@polkadot/types/codec';
import { TimestampedValue } from '@open-web3/orml-types/interfaces';
import { getValueFromTimestampValue, observeRPC, getOraclePrice } from '../helpers';
import BaseSubstrateGuardian from '../../guardians/BaseSubstrateGuardian';
import { RPCRefreshPeriod } from '../../constants';
import { Price } from '../../types';
import Task from '../Task';

export default class PricesTask<CurrencyId extends Codec> extends Task<{ key: any; period: number }, Price> {
  validationSchema() {
    return Joi.object({
      key: Joi.any().required(),
      period: Joi.number().default(RPCRefreshPeriod),
    }).required();
  }

  async start(guardian: BaseSubstrateGuardian) {
    const { apiRx } = await guardian.isReady();

    const { key, period } = this.arguments;
    if (key === 'all') {
      return observeRPC<Vec<ITuple<[Codec, Option<TimestampedValue>]>>>(
        apiRx.rpc.oracle.getAllValues,
        ['Aggregated'],
        period
      ).pipe(
        mergeMap(
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

    const keys = (Array.isArray(key) ? key : [key]).map((x) => apiRx.createType('CurrencyId', x));
    return from(keys).pipe(
      mergeMap((key) =>
        from(getOraclePrice(apiRx, period)(key)).pipe(
          map((price) => ({ key: key.toString(), value: price.toFixed(0) }))
        )
      ),
      filter((price) => price.value.length > 0)
    );
  }
}
