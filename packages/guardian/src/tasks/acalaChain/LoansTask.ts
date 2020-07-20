import Joi from '@hapi/joi';
import { Observable, from, combineLatest } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { DerivedUserLoan, DerivedLoanType } from '@acala-network/api-derive';
import { collateralToUSD, calcCollateralRatio, convertToFixed18, debitToUSD } from '@acala-network/app-util';
import { TimestampedValue } from '@open-web3/orml-types/interfaces';
import { CurrencyId } from '@acala-network/types/interfaces';
import { createAccountCurrencyIdPairs, getValueFromTimestampValue } from '../helpers';
import { AcalaGuardian } from '../../guardians';
import Task from '../Task';

export type LoanTask = {
  account: string;
  currencyId: string;
  debits: string;
  debitsUSD: string;
  collaterals: string;
  collateralRatio: string;
};

export default class LoansTask extends Task<{ account: string | string[]; currencyId: string | string[] }, LoanTask> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx } = await guardian.isReady();

    const { account } = this.arguments;
    let { currencyId } = this.arguments;

    const stableCurrencyId = apiRx.consts.cdpTreasury.getStableCurrencyId as CurrencyId;
    const collateralCurrencyIds = apiRx.consts.cdpEngine.collateralCurrencyIds.toHuman() as string[];

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

    // setup stream
    return from(pairs).pipe(
      flatMap(({ account, currencyId }) =>
        combineLatest([
          (apiRx.derive as any).loan.loan(account, currencyId) as Observable<DerivedUserLoan>,
          (apiRx.derive as any).loan.loanType(currencyId) as Observable<DerivedLoanType>,
          (apiRx.derive as any).price.price(currencyId) as Observable<TimestampedValue>,
          (apiRx.derive as any).price.price(stableCurrencyId) as Observable<TimestampedValue>,
        ]).pipe(
          map(([loan, loanType, collateralPrice, stableCoinPrice]) => {
            const collateralUSD = collateralToUSD(
              convertToFixed18(loan.collaterals),
              convertToFixed18(getValueFromTimestampValue(collateralPrice))
            );
            const debitsUSD = debitToUSD(
              convertToFixed18(loan.debits),
              convertToFixed18(loanType.debitExchangeRate),
              convertToFixed18(getValueFromTimestampValue(stableCoinPrice))
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
          })
        )
      )
    );
  }
}
