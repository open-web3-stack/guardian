import { readConfig } from '@open-web3/guardian-cli';
import dotenv from 'dotenv';
import { getEnv } from '../getEnv';

dotenv.config();

const read = () => {
  const { config: configPath } = require('yargs').demandOption('config').argv;

  const config = readConfig(configPath);

  let nodeEndpoint: string; // 'ws://localhost:9944';
  if (config && config['guardians']) {
    nodeEndpoint = config['guardians']['acala-guardian'].nodeEndpoint;
  } else {
    nodeEndpoint = getEnv('NODE_ENDPOINT');
  }
  const address = getEnv('ADDRESS'); // '5GHYezbSCbiJcU1iCwN2YMnSMohDSZdudfZyEAYGneyx4xp3'
  const SURI = getEnv('SURI'); // //Charlie
  const margin = parseFloat(getEnv('MARGIN')); // 0.1

  return {
    nodeEndpoint,
    address,
    SURI,
    margin
  };
};

export default read;
