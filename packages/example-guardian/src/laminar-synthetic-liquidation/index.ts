#!/usr/bin/env node

import { LiquidityPool } from '@open-web3/guardian/types';
import { ActionRegistry } from '@open-web3/guardian';
import { setupApi } from './setupApi';
import { setDefaultConfig, logger } from '../utils';

const run = async () => {
  setDefaultConfig('laminar-synthetic-liquidation-guardian.yml');

  const { liquidate } = await setupApi();

  let ready = true;

  ActionRegistry.register('liquidate', (args: any, data: LiquidityPool) => {
    if (!ready) return;
    if (data.collateralRatio === '0') return;

    ready = false;

    liquidate(data)
      .catch((e) => logger.error(e))
      .finally(() => {
        ready = false;
      });
  });

  // start guardian
  require('@open-web3/guardian-cli');
};

export default run;

// if called directly
if (require.main === module) {
  run().catch((error) => {
    logger.error(error);
    process.exit(-1);
  });
}
