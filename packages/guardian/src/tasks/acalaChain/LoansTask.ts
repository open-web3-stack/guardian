import Joi from 'joi';
import { Observable, from, combineLatest } from 'rxjs';
import { map, flatMap, filter } from 'rxjs/operators';
import { DerivedUserLoan, DerivedLoanType } from '@acala-network/api-derive';
import { collateralToUSD, calcCollateralRatio, convertToFixed18, debitToUSD } from '@acala-network/app-util';
import { createAccountCurrencyIdPairs, getOraclePrice } from '../helpers';
import { AcalaGuardian } from '../../guardians';
import { Loan } from '../../types';
import Task from '../Task';

export default class LoansTask extends Task<
  { account: string | string[]; currencyId: string | string[]; period?: number },
  Loan
> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      period: Joi.number().default(30_000),
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx } = await guardian.isReady();

    const { account, period } = this.arguments;
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

    const getPrice = getOraclePrice(apiRx, period);

    // setup stream
    return from(pairs).pipe(
      flatMap(({ account, currencyId }) =>
        combineLatest([
          (apiRx.derive as any).loan.loan(account, currencyId) as Observable<DerivedUserLoan>,
          (apiRx.derive as any).loan.loanType(currencyId) as Observable<DerivedLoanType>,
          getPrice(currencyId),
          getPrice(stableCurrencyId),
        ]).pipe(
          map(([loan, loanType, collateralPrice, stableCoinPrice]) => {
            const collateralUSD = collateralToUSD(
              convertToFixed18(loan.collaterals),
              convertToFixed18(Number(collateralPrice.toFixed(0)))
            );
            const debitsUSD = debitToUSD(
              convertToFixed18(loan.debits),
              convertToFixed18(loanType.debitExchangeRate),
              convertToFixed18(Number(stableCoinPrice.toFixed(0)))
            );

            const collateralRatio = calcCollateralRatio(collateralUSD, debitsUSD);

            return {
              account,
              currencyId,
              debits: loan.debits.toString(),
              debitsUSD: debitsUSD.toString(),
              collaterals: loan.collaterals.toString(),
              collateralRatio: collateralRatio.isNaN() ? '0' : collateralRatio.toString(),
            };
          }),
          filter((i) => i.collateralRatio !== '0')
        )
      )
    );
  }
}
