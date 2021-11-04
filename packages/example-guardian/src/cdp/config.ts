import dotenv from 'dotenv';
import { getEnv } from '../getEnv';

dotenv.config();

export const config = () => {
  const SURI = getEnv('SURI');
  const address = getEnv('ADDRESS');

  return { SURI, address };
};
