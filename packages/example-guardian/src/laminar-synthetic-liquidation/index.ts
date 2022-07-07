import { LiquidityPool } from '@open-web3/guardian';
import { ApiManager } from '@open-web3/api';
import { ActionRegistry } from '@open-web3/guardian';
import { config } from './config';
import { setupLaminarApi } from '../setupLaminarApi';
import setupKeyring from '../setupKeyring';
import { setDefaultConfig, logger } from '../utils';

type Metadata = {
  network: string;
  nodeEndpoint: string | string[];
};

export default async () => {
  setDefaultConfig('laminar-synthetic-liquidation-guardian.yml');

  const { SURI, address } = config();
  const { signer } = await setupKeyring(SURI, address);

  let _apiManager: ApiManager;
  const getApiManager = async (nodeEndpoint: string | string[]): Promise<ApiManager> => {
    if (!_apiManager) {
      const api = await setupLaminarApi(nodeEndpoint);
      _apiManager = api.apiManager;
      return _apiManager;
    }
    return _apiManager;
  };

  const liquidate = async (pool: LiquidityPool, metadata: Metadata) => {
    const { poolId, currencyId, syntheticIssuance } = pool;
    const apiManager = await getApiManager(metadata.nodeEndpoint);
    const tx = apiManager.api.tx.syntheticProtocol.liquidate(poolId, currencyId as any, syntheticIssuance);
    return apiManager.signAndSend(tx, { account: signer }).finalized;
  };

  let ready = true;

  ActionRegistry.register('liquidate', (data: LiquidityPool, metadata: Metadata) => {
    if (!ready) return;

    ready = false;

    liquidate(data, metadata)
      .catch((e) => logger.error(e))
      .finally(() => {
        ready = true;
      });
  });

  // start guardian
  require('@open-web3/guardian-cli');
};
