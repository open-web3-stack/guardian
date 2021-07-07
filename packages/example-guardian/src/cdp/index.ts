import { Loan } from '@open-web3/guardian/types';
import { ActionRegistry, utils } from '@open-web3/guardian';
import { FixedPointNumber } from '@acala-network/sdk-core';
import { config } from './config';
import setupAcalaApi from '../setupAcalaApi';
import setupKeyring from '../setupKeyring';
import { setDefaultConfig, logger } from '../utils';

export default async () => {
  setDefaultConfig('cdp-guardian.yml');

  const { nodeEndpoint, SURI, address } = config();
  const { apiManager } = await setupAcalaApi(nodeEndpoint);
  const { signer } = await setupKeyring(SURI, address);

  // adjust loan by +10% collateral
  const adjustLoan = (loan: Loan) => {
    const currencyId = apiManager.api.createType('CurrencyId', JSON.parse(loan.currencyId));
    const precision = utils.tokenPrecision((currencyId as any).asToken.toString());

    const amount = FixedPointNumber.fromInner(loan.collaterals, precision);
    const adjusment = amount.times(FixedPointNumber.fromRational(1, 10)); // +10% collateral
    adjusment.setPrecision(precision);

    const tx = apiManager.api.tx.honzon.adjustLoan(currencyId as any, adjusment._getInner().toString(), 0);

    return apiManager.signAndSend(tx, { account: signer }).inBlock;
  };

  let ready = true;

  ActionRegistry.register('unsafeLoan', (args: any, data: Loan) => {
    if (!ready) return;
    ready = false;
    adjustLoan(data)
      .catch((e) => logger.error(e))
      .finally(() => {
        ready = true;
      });
  });

  // start guardian
  require('@open-web3/guardian-cli');
};
