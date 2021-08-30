import dotenv from 'dotenv';
import { getEnv } from '../getEnv';

dotenv.config();

export const config = () => {
  const tokenA = getEnv('TOKEN_A');
  const tokenB = getEnv('TOKEN_B');

  return { tokenA, tokenB };
};
