#!/usr/bin/env node

import '@open-web3/acala-guardian';
import '@open-web3/laminar-guardian';

import guardian from '@open-web3/guardian';
import readConfig from './read-config';

export { readConfig };

const { config: configPath } = require('yargs')
  .scriptName('guardian')
  .usage('$0 [args]')
  .option('config', {
    type: 'string',
    describe: 'YAML config file'
  })
  .help()
  .demandOption('config').argv;

const config = readConfig(configPath);

// run guardian
guardian(config as any);
