import Guardian from './Guardian';
import GuardianRegistry, { GuardianConstructor } from './GuardianRegistry';

import { Config } from './types';
import validateConfig from './validate-config';

export { default as SubstrateGuardian } from './SubstrateGuardian';
export { default as BaseSubstrateGuardian } from './BaseSubstrateGuardian';
export { default as Task } from './Task';

export * from './actions';
export * from './tasks';
export * from './types';

export { Guardian, GuardianRegistry, GuardianConstructor };

export default async (config: Config) => {
  config = validateConfig(config);

  // create guardians
  const guardians = config.guardians.map((guardianConfig) => GuardianRegistry.create(guardianConfig));

  // start monitoring
  await Promise.all(guardians.map((guardian) => guardian.start()));

  // unsubscribe method
  return () => {
    guardians.forEach((guardian) => guardian.teardown());
  };
};
