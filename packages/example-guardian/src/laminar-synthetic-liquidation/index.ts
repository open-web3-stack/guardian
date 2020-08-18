#!/usr/bin/env node

import { LiquidityPool } from '@open-web3/guardian/types';
import { ActionRegistry } from '@open-web3/guardian';
import { logger } from '@polkadot/util';
import { setupApi } from './setupApi';
import { setDefaultConfig } from '../utils';

const l = logger('laminar-synthetic-liquidation-guardian');

const run = async () => {
  setDefaultConfig('laminar-synthetic-liquidation-guardian.yml');

  const { liquidate } = await setupApi();

  let ready = true;

  ActionRegistry.register('liquidate', (args: any, data: LiquidityPool) => {
    if (!ready) return;
    if (data.collateralRatio === '0') return;

    ready = false;

    liquidate(data)
      .catch(l.error)
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
    l.error(error);
    process.exit(-1);
  });
}
