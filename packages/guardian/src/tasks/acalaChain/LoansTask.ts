import Joi from 'joi';
import { CurrencyId } from '@acala-network/types/interfaces';
import { FixedPointNumber } from '@acala-network/sdk-core';
import { autorun$, tokenPrecision } from '../../utils';
import { createAccountCurrencyIdPairs } from '../helpers';
import { AcalaGuardian } from '../../guardians';
import { Loan } from '../../types';
import Task from '../Task';
import getOraclePrice from '../getOraclePrice';

export default class LoansTask extends Task<{ account: string | string[]; currencyId: any }, Loan> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.any().required()
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx, storage } = await guardian.isReady();

    const { account, currencyId } = this.arguments;

    const stableCoin = apiRx.consts.cdpEngine.getStableCurrencyId;
    const stableCoinPrice = apiRx.consts.prices.stableCurrencyFixedPrice;
    const collateralCurrencyIds = apiRx.consts.cdpEngine.collateralCurrencyIds;

    let currencyIds: CurrencyId[];

    if (currencyId === 'all') {
      currencyIds = collateralCurrencyIds;
    } else {
      currencyIds = (Array.isArray(currencyId) ? currencyId : [currencyId]).map(
        (x) => apiRx.createType('CurrencyId', x) as any
      );
    }

    // create {account, currencyId} paris
    const pairs = createAccountCurrencyIdPairs<CurrencyId>(account, currencyIds);

    const oraclePrice = getOraclePrice<CurrencyId>(storage.acalaOracle);

    return autorun$<Loan>((subscriber) => {
      for (const { account, currencyId } of pairs) {
        const position = storage.loans.positions(currencyId.toHex(), account);
        if (!position) continue;

        const stableCoinPrecision = tokenPrecision(stableCoin.asToken.toString());
        const debitExchangeRate = storage.cdpEngine.debitExchangeRate(currencyId.toHex());
        const exchangeRate = debitExchangeRate?.isSome
          ? debitExchangeRate.unwrap()
          : apiRx.consts.cdpEngine.defaultDebitExchangeRate;

        console.log(debitExchangeRate?.toString());

        const collateralPrice = oraclePrice(currencyId);
        if (!collateralPrice) continue;

        const collateralPrecision = tokenPrecision(currencyId.asToken.toString());

        const collateral = FixedPointNumber.fromInner(position.collateral.toString(), collateralPrecision);
        const collateralUSD = FixedPointNumber.fromInner(collateralPrice).times(collateral);

        const debit = FixedPointNumber.fromInner(position.debit.toString(), stableCoinPrecision);
        if (debit.isZero()) continue;
        const debitsUSD = debit
          .times(FixedPointNumber.fromInner(exchangeRate.toString()))
          .times(FixedPointNumber.fromInner(stableCoinPrice.toString()));

        const collateralRatio = collateralUSD.div(debitsUSD);

        if (collateralRatio.isNaN()) continue;

        // set precision back stable coin
        debitsUSD.setPrecision(stableCoinPrecision);

        subscriber.next({
          account,
          currencyId: currencyId.toString(),
          debits: position.debit.toString(),
          debitsUSD: debitsUSD._getInner().toFixed(0),
          collaterals: position.collateral.toString(),
          collateralRatio: collateralRatio.toString()
        });
      }
    });
  }
}
