import Joi from 'joi';
import { CurrencyId } from '@acala-network/types/interfaces';
import { collateralToUSD, calcCollateralRatio, convertToFixed18, debitToUSD } from '@acala-network/app-util';
import { autorun$ } from '../../utils';
import { createAccountCurrencyIdPairs } from '../helpers';
import { AcalaGuardian } from '../../guardians';
import { Loan } from '../../types';
import Task from '../Task';
import getOraclePrice from '../getOraclePrice';

export default class LoansTask extends Task<{ account: string | string[]; currencyId: any }, Loan> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.any().required(),
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx, storage } = await guardian.isReady();

    const { account, currencyId } = this.arguments;

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

        const debitExchangeRate = storage.cdpEngine.debitExchangeRate(currencyId.toHex());
        const exchangeRate = debitExchangeRate?.isSome
          ? debitExchangeRate.unwrap()
          : apiRx.consts.cdpEngine.defaultDebitExchangeRate;

        const collateralPrice = oraclePrice(currencyId);
        if (!collateralPrice) continue;

        const collateralUSD = collateralToUSD(convertToFixed18(position.collateral), convertToFixed18(collateralPrice));
        const debitsUSD = debitToUSD(
          convertToFixed18(position.debit),
          convertToFixed18(exchangeRate),
          convertToFixed18(stableCoinPrice)
        );

        const collateralRatio = calcCollateralRatio(collateralUSD, debitsUSD);

        if (collateralRatio.isNaN()) continue;

        subscriber.next({
          account,
          currencyId: currencyId.toString(),
          debits: position.debit.toString(),
          debitsUSD: debitsUSD.toString(),
          collaterals: position.collateral.toString(),
          collateralRatio: collateralRatio.toString(),
        });
      }
    });
  }
}
