import * as Joi from 'joi';
import { castArray } from 'lodash';
import { from, firstValueFrom, combineLatest } from 'rxjs';
import { map, mergeMap, filter } from 'rxjs/operators';
import {
  AcalaPrimitivesCurrencyCurrencyId,
  AcalaPrimitivesTradingPair
} from '@acala-network/types/interfaces/types-lookup';
import { FixedPointNumber, TokenPair } from '@acala-network/sdk-core';
import { Task } from '@open-web3/guardian';
import { Pool } from '../types';
import AcalaGuardian from '../AcalaGuardian';

export default class PoolsTask extends Task<{ currencyId: any }, Pool> {
  validationSchema() {
    return Joi.object({
      currencyId: Joi.any().required()
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx } = await guardian.isReady();

    const { currencyId } = this.arguments;

    const stableCoin = apiRx.consts.cdpEngine.getStableCurrencyId;

    let pairs: AcalaPrimitivesTradingPair[];

    if (currencyId === 'all') {
      const tradingPair = await firstValueFrom(apiRx.query.dex.liquidityPool.entries());

      pairs = tradingPair
        .filter(([, value]) => {
          const [balance1, balance2] = value;
          return balance1 && balance2;
        })
        .map(
          ([
            {
              args: [key]
            }
          ]) => key
        );
    } else {
      const currencies = castArray(currencyId);
      pairs = currencies
        .map((x) => apiRx.createType<AcalaPrimitivesCurrencyCurrencyId>('AcalaPrimitivesCurrencyCurrencyId', x))
        .map((currencyId) => TokenPair.fromCurrencies(stableCoin, currencyId).toTradingPair(apiRx));
    }

    return from(pairs).pipe(
      mergeMap((pair) => {
        const [baseCurrency, otherCurrency] = pair;
        return combineLatest([
          apiRx.query.dex.liquidityPool(pair),
          apiRx.query.assetRegistry.assetMetadatas({ NativeAssetId: baseCurrency.toJSON() }),
          apiRx.query.assetRegistry.assetMetadatas({ NativeAssetId: otherCurrency.toJSON() })
        ]).pipe(
          filter(([, baseMeta, otherMeta]) => baseMeta.isSome && otherMeta.isSome),
          map(([[base, other], baseMeta, otherMeta]) => {
            const basePrecision = baseMeta.unwrap().decimals.toBn().toNumber();
            const otherPrecision = otherMeta.unwrap().decimals.toBn().toNumber();
            const _base = FixedPointNumber.fromInner(base.toString(), basePrecision);
            const _other = FixedPointNumber.fromInner(other.toString(), otherPrecision);
            const price = baseCurrency.eq(stableCoin) ? _base.div(_other) : _other.div(_base);
            price.setPrecision(18);
            return {
              currencyId: pair.toString(),
              price: price._getInner().toFixed(0),
              baseLiquidity: base.toString(),
              otherLiquidity: other.toString()
            };
          })
        );
      })
    );
  }
}
