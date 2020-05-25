import { Config } from './types';
import validateConfig from './validate-config';
import { registerGuardians, GuardianRegistry, Guardian } from './guardians';
import { registerActionRunners, ActionRegistry } from './actions';

export { ActionRegistry, GuardianRegistry, Guardian };

registerGuardians();
registerActionRunners();

const guardian = (config: Config) => {
  config = validateConfig(config);

  const guardians = Object.entries(config.guardians).map(([name, guardianConfig]) => {
    const { networkType: identifier } = guardianConfig;
    return GuardianRegistry.create(identifier, name, guardianConfig);
  });

  guardians.forEach((guardian) => guardian.start());

  return () => {
    guardians.forEach((guardian) => guardian.stop());
  };
};

export default guardian;
