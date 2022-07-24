import * as Joi from 'joi';
import Big from 'big.js';
import { castArray } from 'lodash';
import { combineLatest, of, from, firstValueFrom } from 'rxjs';
import { mergeMap, map, filter } from 'rxjs/operators';
import { Option, Vec } from '@polkadot/types/codec';
import { CurrencyId, ExchangeRate, Position } from '@acala-network/types/interfaces';
import { FixedPointNumber } from '@acala-network/sdk-core';
import { Task, utils } from '@open-web3/guardian';
import { Loan } from '../types';
import AcalaGuardian from '../AcalaGuardian';
import { RPCRefreshPeriod } from '../constants';

export default class LoansTask extends Task<{ account: string | string[]; currencyId: any }, Loan> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.any().required()
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx } = await guardian.isReady();

    const { account, currencyId } = this.arguments;

    const stableCoin = apiRx.consts.cdpEngine.getStableCurrencyId;
    const stableCoinPrice = apiRx.consts.prices.stableCurrencyFixedPrice;

    let currencyIds: CurrencyId[];

    if (currencyId === 'all') {
      const collateralCurrencyIds = (await firstValueFrom(apiRx.query.cdpEngine.collateralParams.keys())).map(
        (x) => x.args[0]
      );
      currencyIds = apiRx.createType<Vec<CurrencyId>>('Vec<CurrencyId>', collateralCurrencyIds);
    } else {
      currencyIds = castArray(currencyId).map((x) => apiRx.createType<CurrencyId>('CurrencyId', x));
    }

    // create {account, currencyId} paris
    const pairs = utils.createAccountCurrencyIdPairs<CurrencyId>(account, currencyIds);

    const oraclePrice = utils.getOraclePrice<CurrencyId>(apiRx, RPCRefreshPeriod, {
      [stableCoin.toString()]: Big(stableCoinPrice.toString())
    });

    return from(pairs).pipe(
      mergeMap(({ currencyId, account }) =>
        apiRx.query.loans.positions<Position>(currencyId, account).pipe(
          mergeMap((position) =>
            combineLatest([of(position), apiRx.query.cdpEngine.debitExchangeRate<Option<ExchangeRate>>(currencyId)])
          ),
          mergeMap(([position, debitExchangeRate]) => {
            const exchangeRate = debitExchangeRate.isSome
              ? debitExchangeRate.unwrap()
              : apiRx.consts.cdpEngine.defaultDebitExchangeRate;
            return combineLatest([
              of(position),
              of(exchangeRate),
              oraclePrice(currencyId),
              apiRx.query.assetRegistry.assetMetadatas({ NativeAssetId: stableCoin.toJSON() }),
              apiRx.query.assetRegistry.assetMetadatas({ NativeAssetId: currencyId.toJSON() })
            ]);
          }),
          filter(([position, exchangeRate, collateralPrice, stableCoinMeta, collateralMeta]) => {
            if (stableCoinMeta.isNone) return false;
            if (collateralMeta.isNone) return false;
            const stableCoinPrecision = stableCoinMeta.unwrap().decimals.toBn().toNumber();
            const collateralPrecision = collateralMeta.unwrap().decimals.toBn().toNumber();

            const collateral = FixedPointNumber.fromInner(position.collateral.toString(), collateralPrecision);
            const collateralUSD = FixedPointNumber.fromInner(collateralPrice.toFixed(0)).times(collateral);

            const debit = FixedPointNumber.fromInner(position.debit.toString(), stableCoinPrecision);
            if (debit.isZero()) return false;

            const debitsUSD = debit
              .times(FixedPointNumber.fromInner(exchangeRate.toString()))
              .times(FixedPointNumber.fromInner(stableCoinPrice.toString()));

            const collateralRatio = collateralUSD.div(debitsUSD);

            if (collateralRatio.isNaN()) return false;

            return true;
          }),
          map(([position, exchangeRate, collateralPrice, stableCoinMeta, collateralMeta]) => {
            const stableCoinPrecision = stableCoinMeta.unwrap().decimals.toBn().toNumber();
            const collateralPrecision = collateralMeta.unwrap().decimals.toBn().toNumber();

            const collateral = FixedPointNumber.fromInner(position.collateral.toString(), collateralPrecision);
            const collateralUSD = FixedPointNumber.fromInner(collateralPrice.toFixed(0)).times(collateral);

            const debit = FixedPointNumber.fromInner(position.debit.toString(), stableCoinPrecision);

            const debitsUSD = debit
              .times(FixedPointNumber.fromInner(exchangeRate.toString()))
              .times(FixedPointNumber.fromInner(stableCoinPrice.toString()));

            const collateralRatio = collateralUSD.div(debitsUSD);

            // set precision back stable coin
            debitsUSD.setPrecision(stableCoinPrecision);

            return {
              account,
              currencyId: currencyId.toString(),
              debits: position.debit.toString(),
              debitsUSD: debitsUSD._getInner().toFixed(0),
              collaterals: position.collateral.toString(),
              collateralRatio: collateralRatio.toString()
            };
          })
        )
      )
    );
  }
}
