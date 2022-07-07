import * as dotenv from 'dotenv';
import { getEnv } from '../getEnv';

dotenv.config();

const read = () => {
  const address = getEnv('ADDRESS'); // '5GHYezbSCbiJcU1iCwN2YMnSMohDSZdudfZyEAYGneyx4xp3'
  const SURI = getEnv('SURI'); // //Charlie

  return { address, SURI };
};

export default read;
