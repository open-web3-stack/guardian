import { GuardianConstructor, GuardianRegistry } from '@open-web3/guardian';
import AcalaGuardian from './AcalaGuardian';
export * from './tasks';
export * from './types';

GuardianRegistry.register('acala', AcalaGuardian as any as GuardianConstructor);

export { AcalaGuardian };
