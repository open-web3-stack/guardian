import * as Joi from 'joi';
import { castArray } from 'lodash';
import { from, firstValueFrom, combineLatest } from 'rxjs';
import { map, mergeMap, filter } from 'rxjs/operators';
import { Option } from '@polkadot/types/codec';
import { AcalaPrimitivesTradingPair } from '@acala-network/types/interfaces/types-lookup';
import { AcalaAssetMetadata } from '@acala-network/types/interfaces';
import { FixedPointNumber } from '@acala-network/sdk-core';
import { Pool } from '../../types';
import { Task } from '@open-web3/guardian';
import AcalaGuardian from '../../AcalaGuardian';

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
    const nativeCoin = apiRx.consts.currencies.getNativeCurrencyId;

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
        .map((x) => apiRx.createType('CurrencyId', x))
        .map((currencyId) => {
          return currencyId.eq(nativeCoin)
            ? apiRx.createType('AcalaPrimitivesTradingPair', [currencyId, stableCoin])
            : apiRx.createType('AcalaPrimitivesTradingPair', [stableCoin, currencyId]);
        });
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
