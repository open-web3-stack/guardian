import * as Joi from 'joi';
import { castArray } from 'lodash';
import { from, firstValueFrom, combineLatest } from 'rxjs';
import { map, mergeMap, filter } from 'rxjs/operators';
import { Option } from '@polkadot/types/codec';
import {
  AcalaPrimitivesCurrencyCurrencyId,
  AcalaPrimitivesTradingPair
} from '@acala-network/types/interfaces/types-lookup';
import { AcalaAssetMetadata } from '@acala-network/types/interfaces';
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
        .map(([key, value]) => {
          const [balance1, balance2] = value;

          if (balance1 && balance2) {
            return key.args[0];
          }

          return undefined;
        })
        .filter((p): p is AcalaPrimitivesTradingPair => p !== undefined);
    } else {
      const currencies = castArray(currencyId);
      pairs = currencies
        .map(
          (x) =>
            apiRx.createType<AcalaPrimitivesCurrencyCurrencyId>(
              'AcalaPrimitivesCurrencyCurrencyId',
              x
            ) as AcalaPrimitivesCurrencyCurrencyId
        )
        .map((currencyId) => TokenPair.fromCurrencies(stableCoin, currencyId).toTradingPair(apiRx));
    }

    return from(pairs).pipe(
      mergeMap((pair) => {
        const [baseCurrency, otherCurrency] = pair;
        return combineLatest([
          apiRx.query.dex.liquidityPool(pair),
          apiRx.query.assetRegistry.assetMetadatas<Option<AcalaAssetMetadata>>({
            NativeAssetId: baseCurrency.toJSON()
          }),
          apiRx.query.assetRegistry.assetMetadatas<Option<AcalaAssetMetadata>>({
            NativeAssetId: otherCurrency.toJSON()
          })
        ]).pipe(
          filter(([, baseMeta, otherMeta]) => baseMeta.isSome && otherMeta.isSome),
          map(([[base, other], baseMeta, otherMeta]) => {
            const basePrecision = baseMeta.unwrap().decimals.toNumber();
            const otherPrecision = otherMeta.unwrap().decimals.toNumber();
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
