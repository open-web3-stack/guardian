import path from 'path';
import { readConfig } from '@open-web3/guardian';
import dotenv from 'dotenv';
import { getEnv } from '../getEnv';

dotenv.config();

const read = (configName: string) => {
  if (!process.argv.find((i) => i.startsWith('--config'))) {
    process.argv.push('--config');
    process.argv.push(path.resolve(__dirname, '..', configName));
  }

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

  const nodeEndpoint = config.guardians['acala-guardian'].nodeEndpoint || getEnv('NODE_ENDPOINT'); // 'ws://localhost:9944';
  const address = getEnv('ADDRESS'); // '5GHYezbSCbiJcU1iCwN2YMnSMohDSZdudfZyEAYGneyx4xp3'
  const SURI = getEnv('SURI'); // //Charlie
  const margin = getEnv('MARGIN'); // 0.1

  return {
    nodeEndpoint,
    address,
    SURI,
    margin,
  };
};

export default read;
