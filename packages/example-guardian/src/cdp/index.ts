import { Loan } from '@open-web3/guardian';
import { ApiManager } from '@open-web3/api';
import { ActionRegistry } from '@open-web3/guardian';
import { FixedPointNumber } from '@acala-network/sdk-core';
import { config } from './config';
import setupAcalaApi from '../setupAcalaApi';
import setupKeyring from '../setupKeyring';
import { setDefaultConfig, logger, tokenPrecision } from '../utils';

type Metadata = {
  network: string;
  nodeEndpoint: string | string[];
};

export default async () => {
  setDefaultConfig('cdp-guardian.yml');

  const { SURI, address } = config();
  const { signer } = await setupKeyring(SURI, address);

  let _apiManager: ApiManager;
  const getApiManager = async (nodeEndpoint: string | string[]): Promise<ApiManager> => {
    if (!_apiManager) {
      const api = await setupAcalaApi(nodeEndpoint);
      _apiManager = api.apiManager;
      return _apiManager;
    }
    return _apiManager;
  };

  // adjust loan by +10% collateral
  const adjustLoan = async (loan: Loan, metadata: Metadata) => {
    const apiManager = await getApiManager(metadata.nodeEndpoint);
    const currencyId = apiManager.api.createType('CurrencyId', JSON.parse(loan.currencyId));
    const precision = await tokenPrecision(apiManager.api, currencyId.asToken.toString());

    const amount = FixedPointNumber.fromInner(loan.collaterals, precision);
    const adjusment = amount.times(FixedPointNumber.fromRational(1, 10)); // +10% collateral
    adjusment.setPrecision(precision);

    const tx = apiManager.api.tx.honzon.adjustLoan(currencyId as any, adjusment._getInner().toFixed(0), 0);

    return apiManager.signAndSend(tx, { account: signer }).inBlock;
  };

  let ready = true;

  ActionRegistry.register('unsafeLoan', (data: Loan, metadata: Metadata) => {
    if (!ready) return;
    ready = false;
    adjustLoan(data, metadata)
      .catch((e) => logger.error(e))
      .finally(() => {
        ready = true;
      });
  });

  // start guardian
  require('@open-web3/guardian-cli');
};
