import { LiquidityPool } from '@open-web3/guardian/types';
import { ActionRegistry } from '@open-web3/guardian';
import { config } from './config';
import { setupLaminarApi } from '../setupLaminarApi';
import setupKeyring from '../setupKeyring';
import { setDefaultConfig, logger } from '../utils';

export default async () => {
  setDefaultConfig('laminar-synthetic-liquidation-guardian.yml');

  const { nodeEndpoint, SURI, address } = config();

  const { apiManager } = await setupLaminarApi(nodeEndpoint);
  const { signer } = await setupKeyring(SURI, address);

  const liquidate = async (pool: LiquidityPool) => {
    const { poolId, currencyId, syntheticIssuance } = pool;
    const tx = apiManager.api.tx.syntheticProtocol.liquidate(poolId, currencyId as any, syntheticIssuance);
    return apiManager.signAndSend(tx, { account: signer }).finalized;
  };

  let ready = true;

  ActionRegistry.register('liquidate', (args: any, data: LiquidityPool) => {
    if (!ready) return;
    if (data.collateralRatio === '0') return;

    ready = false;

    liquidate(data)
      .catch((e) => logger.error(e))
      .finally(() => {
        ready = true;
      });
  });

  // start guardian
  require('@open-web3/guardian-cli');
};
