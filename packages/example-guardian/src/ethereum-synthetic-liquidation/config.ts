import * as dotenv from 'dotenv';

dotenv.config();

export const config = () => {
  const nodeEndpoint = process.env.NODE_ENDPOINT;
  const privateKey = process.env.PRIVATE_KEY;
  const address = process.env.ADDRESS;
  const collateralRatio = process.env.COLLATERAL_RATIO || '1.05';

  if (!nodeEndpoint) throw Error('process.env.NODE_ENDPOINT is missing');
  if (!privateKey) throw Error('process.env.SURI is missing');
  if (!address) throw Error('process.env.ADDRESS is missing');

  return { nodeEndpoint, privateKey, address, collateralRatio };
};
