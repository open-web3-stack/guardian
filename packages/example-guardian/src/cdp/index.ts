#!/usr/bin/env node

import { Loan } from '@open-web3/guardian/types';
import { logger } from '@polkadot/util';
import { ActionRegistry } from '@open-web3/guardian';
import { setupApi } from './setupApi';
import { setDefaultConfig } from '../utils';

const l = logger('cdp-guardian');

const run = async () => {
  setDefaultConfig('cdp-guardian.yml');

  const { adjustLoan } = await setupApi();

  let ready = true;

  ActionRegistry.register('unsafeLoan', (args: any, data: Loan) => {
    if (!ready) return;
    ready = false;
    adjustLoan(data)
      .catch(l.error)
      .finally(() => {
        ready = true;
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
