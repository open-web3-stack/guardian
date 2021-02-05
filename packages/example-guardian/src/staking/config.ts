import dotenv from 'dotenv';
import { getEnv } from '../getEnv';

dotenv.config();

export const config = () => {
  const nodeEndpoint = getEnv('NODE_ENDPOINT');
  const address = getEnv('ADDRESS');

  return { nodeEndpoint, address };
};
