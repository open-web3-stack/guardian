import Guardian from './Guardian';
import GuardianRegistry from './GuardianRegistry';
import BaseSubstrateGuardian from './BaseSubstrateGuardian';
import SubstrateGuardian from './SubstrateGuardian';
import { Config } from './types';
import validateConfig from './validate-config';

export * from './actions';
export * from './tasks';
export * from './types';

export { Guardian, GuardianRegistry, BaseSubstrateGuardian, SubstrateGuardian };

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
