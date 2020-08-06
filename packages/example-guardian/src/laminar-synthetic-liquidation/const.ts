import path from 'path';
import dotenv from 'dotenv';
import { getEnv } from '../getEnv';

dotenv.config();

export const readConst = () => {
  if (!process.argv.find((i) => i.startsWith('--config'))) {
    process.argv.push('--config');
    process.argv.push(path.resolve(__dirname, '..', 'laminar-synthetic-liquidation-guardian.yml'));
  }

  const nodeEndpoint = getEnv('NODE_ENDPOINT');
  const SURI = getEnv('SURI');
  const address = getEnv('ADDRESS');
  const collateralRatio = getEnv('COLLATERAL_RATIO');

  return { nodeEndpoint, SURI, address, collateralRatio };
};
