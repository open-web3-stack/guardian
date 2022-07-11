import * as Joi from 'joi';
import Big from 'big.js';
import { castArray } from 'lodash';
import { Observable, from } from 'rxjs';
import { mergeMap, map, filter } from 'rxjs/operators';
import { Codec, ITuple } from '@polkadot/types/types';
import { Option, Vec } from '@polkadot/types/codec';
import { TimestampedValue } from '@open-web3/orml-types/interfaces';
import { getValueFromTimestampValue, observeRPC, getOraclePrice } from '../utils';
import { RPCRefreshPeriod } from '../../constants';
import { Price } from '../../types';
import Task from '../Task';
import BaseSubstrateGuardian from '../../BaseSubstrateGuardian';

export default class PricesTask extends Task<{ key: any; period: number }, Price> {
  validationSchema() {
    return Joi.object({
      key: Joi.any().required(),
      period: Joi.number().default(RPCRefreshPeriod)
    }).required();
  }

  async start<T extends BaseSubstrateGuardian>(guardian: T) {
    const { apiRx } = await guardian.isReady();

    const { key, period } = this.arguments;
    if (key === 'all') {
      return observeRPC<Vec<ITuple<[Codec, Option<TimestampedValue>]>>>(
        apiRx.rpc['oracle']['getAllValues'],
        ['Aggregated'],
        period
      ).pipe(
        mergeMap((result): Observable<Price> => {
          return from(result).pipe(
            filter(([, item]) => item.isSome),
            map(([key, item]) => ({
              key: key.toString(),
              value: getValueFromTimestampValue(item.unwrap()).toString()
            }))
          );
        })
      );
    }

    const keys = castArray(key).map((x) => apiRx.createType('CurrencyId', x));

    const fixedPrices = {
      [apiRx.consts.prices.getStableCurrencyId.toString()]: Big(apiRx.consts.prices.stableCurrencyFixedPrice.toString())
    };

    return from(keys).pipe(
      mergeMap((key) =>
        from(getOraclePrice(apiRx, period, fixedPrices)(key as any)).pipe(
          map((price) => ({ key: key.toString(), value: price.toFixed(0) }))
        )
      ),
      filter((price) => price.value.length > 0)
    );
  }
}
