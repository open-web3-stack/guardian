import * as dotenv from 'dotenv';
import { getEnv } from '../getEnv';

dotenv.config();

export const config = () => {
  const nodeEndpoint = getEnv('NODE_ENDPOINT');
  const SURI = getEnv('SURI');
  const address = getEnv('ADDRESS');
  const collateralRatio = getEnv('COLLATERAL_RATIO');

  return { nodeEndpoint, SURI, address, collateralRatio };
};
