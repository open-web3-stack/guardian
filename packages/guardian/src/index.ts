import { Config } from './types';
import validateConfig from './validate-config';
import { GuardianRegistry, Guardian } from './guardians';
import { ActionRegistry } from './actions';
import readConfig from './read-config';

export { readConfig };

export { ActionRegistry, GuardianRegistry, Guardian };

export default (config: Config) => {
  config = validateConfig(config);

  // create guardians
  const guardians = Object.entries(config.guardians).map(([name, guardianConfig]) => {
    const { networkType } = guardianConfig;
    return GuardianRegistry.create(networkType, name, guardianConfig);
  });

  // start monitoring
  guardians.forEach((guardian) => guardian.start());

  // unsubscribe method
  return () => {
    guardians.forEach((guardian) => guardian.stop());
  };
};
