import Joi from 'joi';
import { collateralToUSD, calcCollateralRatio, convertToFixed18, debitToUSD } from '@acala-network/app-util';
import { autorun$ } from '@open-web3/guardian/utils';
import { createAccountCurrencyIdPairs } from '../helpers';
import { AcalaGuardian } from '../../guardians';
import { Loan } from '../../types';
import Task from '../Task';
import getOraclePrice from '../getOraclePrice';

export default class LoansTask extends Task<{ account: string | string[]; currencyId: string | string[] }, Loan> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx, storage } = await guardian.isReady();

    const { account } = this.arguments;
    let { currencyId } = this.arguments;

    const stableCurrencyId = apiRx.consts.cdpTreasury.getStableCurrencyId.toString();
    const collateralCurrencyIds = apiRx.consts.cdpEngine.collateralCurrencyIds.toJSON() as string[];

    // validate currency id
    if (currencyId === 'all') {
      currencyId = collateralCurrencyIds;
    } else if (typeof currencyId === 'string') {
      if (!collateralCurrencyIds.includes(currencyId)) throw Error(`${currencyId} is not collateral currencyId`);
    } else {
      currencyId.forEach((currencyId) => {
        if (!collateralCurrencyIds.includes(currencyId)) throw Error(`${currencyId} is not collateral currencyId`);
      });
    }

    // create {account, currencyId} paris
    const pairs = createAccountCurrencyIdPairs(account, currencyId);

    const oraclePrice = getOraclePrice(storage);

    return autorun$<Loan>((subscriber) => {
      for (const { account, currencyId } of pairs) {
        const position = storage.loans.positions(currencyId as any, account);
        if (!position) continue;

        const debitExchangeRate = storage.cdpEngine.debitExchangeRate(currencyId as any);
        const exchangeRate = debitExchangeRate?.isSome
          ? debitExchangeRate.unwrap()
          : apiRx.consts.cdpEngine.defaultDebitExchangeRate;

        const collateralPrice = oraclePrice(currencyId);
        const stableCoinPrice = oraclePrice(stableCurrencyId);

        if (!collateralPrice || !stableCoinPrice) continue;

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
          currencyId,
          debits: position.debit.toString(),
          debitsUSD: debitsUSD.toString(),
          collaterals: position.collateral.toString(),
          collateralRatio: collateralRatio.toString(),
        });
      }
    });
  }
}
