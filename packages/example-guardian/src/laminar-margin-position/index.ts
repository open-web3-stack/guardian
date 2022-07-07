import { Position } from '@open-web3/guardian';
import { ApiManager } from '@open-web3/api';
import { ActionRegistry } from '@open-web3/guardian';
import { setupLaminarApi } from '../setupLaminarApi';
import setupKeyring from '../setupKeyring';
import { config } from './config';
import { setDefaultConfig, logger } from '../utils';

type Metadata = {
  network: string;
  nodeEndpoint: string | string[];
};

export default async () => {
  setDefaultConfig('laminar-margin-position-guardian.yml');

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

  const closePosition = async (position: Position, metadata: Metadata) => {
    const apiManager = await getApiManager(metadata.nodeEndpoint);
    const tx = apiManager.api.tx.marginProtocol.closePosition(position.positionId, 0);
    await apiManager.signAndSend(tx, { account: signer }).finalized;
  };

  let ready = true;
  ActionRegistry.register('close_position', (data: Position, metadata: Metadata) => {
    if (!ready) return;
    ready = false;
    closePosition(data, metadata)
      .catch((e) => logger.error(e))
      .finally(() => {
        ready = true;
      });
  });

  // start guardian
  require('@open-web3/guardian-cli');
};
