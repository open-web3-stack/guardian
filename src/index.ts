import { Config } from './types';
import validateConfig from './validate-config';
import { registerGuardians, GuardianRegistry } from './guardians';
import { registerActions, ActionRegistry } from './actions';

export { ActionRegistry, GuardianRegistry };

registerActions();
registerGuardians();

const guardian = (config: Config) => {
  config = validateConfig(config);

  const guardians = Object.entries(config.guardians).map(([name, guardianConfig]) => {
    const { networkType } = guardianConfig;
    return GuardianRegistry.create(networkType, name, guardianConfig);
  });

  guardians.forEach((guardian) => guardian.start());

  return () => {
    guardians.forEach((guardian) => guardian.stop());
  };
};

export default guardian;
