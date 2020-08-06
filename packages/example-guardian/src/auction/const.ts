import path from 'path';
import { readConfig } from '@open-web3/guardian';
import dotenv from 'dotenv';

dotenv.config();

const read = (configName: string) => {
  if (!process.argv.find((i) => i.startsWith('--config'))) {
    process.argv.push('--config');
    process.argv.push(path.resolve(__dirname, configName));
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

  const nodeEndpoint = config.guardians['acala-guardian'].nodeEndpoint; // 'ws://localhost:9944';
  const bidderAddress = process.env.BIDDER_ADDRESS; // '5GHYezbSCbiJcU1iCwN2YMnSMohDSZdudfZyEAYGneyx4xp3'
  const bidderSURI = process.env.BIDDER_SURI; // //Charlie
  const margin = process.env.MARGIN || '0.05'; // 0.05

  if (!bidderAddress) throw Error('process.env.BIDDER_ADDRESS is missing');
  if (!bidderSURI) throw Error('process.env.BIDDER_SURI is missing');

  return {
    nodeEndpoint,
    bidderAddress,
    bidderSURI,
    margin,
  };
};

export default read;
