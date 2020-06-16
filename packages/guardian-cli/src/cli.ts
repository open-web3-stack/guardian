#!/usr/bin/env node

import guardian, { readConfig } from '@open-web3/guardian';

const { config: configPath } = require('yargs')
  .scriptName('guardian')
  .usage('$0 [args]')
  .option('config', {
    type: 'string',
    describe: 'YAML config file',
  })
  .help()
  .demandOption('config').argv;

const config = readConfig(configPath);

// run guardian
guardian(config);
