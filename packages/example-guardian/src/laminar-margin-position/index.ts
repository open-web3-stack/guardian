import { Position } from '@open-web3/guardian/types';
import { ActionRegistry } from '@open-web3/guardian';
import { setupLaminarApi } from '../setupLaminarApi';
import setupKeyring from '../setupKeyring';
import { config } from './config';
import { setDefaultConfig, logger } from '../utils';

export default async () => {
  setDefaultConfig('laminar-margin-position-guardian.yml');

  const { nodeEndpoint, SURI, address } = config();

  const { apiManager } = await setupLaminarApi(nodeEndpoint);
  const { signer } = await setupKeyring(SURI, address);

  const closePosition = async (position: Position) => {
    const tx = apiManager.api.tx.marginProtocol.closePosition(position.positionId, 0);
    await apiManager.signAndSend(tx, { account: signer }).finalized;
  };

  let ready = true;
  ActionRegistry.register('close_position', (_, data: Position) => {
    if (!ready) return;
    ready = false;
    closePosition(data)
      .catch((e) => logger.error(e))
      .finally(() => {
        ready = true;
      });
  });

  // start guardian
  require('@open-web3/guardian-cli');
};
