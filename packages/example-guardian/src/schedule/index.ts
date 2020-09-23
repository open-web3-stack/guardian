#!/usr/bin/env node

import { Loan } from '@open-web3/guardian/types';
import { ActionRegistry } from '@open-web3/guardian';
import { setupApi } from './setupApi';
import { setDefaultConfig, logger } from '../utils';

const run = async () => {
  setDefaultConfig('schedule.yml');

  const { getBalance } = await setupApi();

  ActionRegistry.register('getBalance', async (args: any, data: Loan) => {
    logger.log('current time: ', new Date());
    const balance = await getBalance();
    logger.log('balance: ', balance.toHuman());
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
