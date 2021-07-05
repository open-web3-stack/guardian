import { Config } from './types';
import validateConfig from './validate-config';
import { GuardianRegistry } from './guardians';

import { tokenPrecision } from './utils';

export * from './guardians';
export * from './actions';

const utils = {
  tokenPrecision
};

export { utils };

export default async (config: Config) => {
  config = validateConfig(config);

  // create guardians
  const guardians = Object.entries(config.guardians).map(([name, guardianConfig]) => {
    const { networkType } = guardianConfig;
    return GuardianRegistry.create(networkType, name, guardianConfig);
  });

  // start monitoring
  await Promise.all(guardians.map((guardian) => guardian.start()));

  // unsubscribe method
  return () => {
    guardians.forEach((guardian) => guardian.stop());
  };
};
