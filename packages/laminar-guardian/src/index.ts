import { GuardianConstructor, GuardianRegistry } from '@open-web3/guardian';
import LaminarGuardian from './LaminarGuardian';
export * from './tasks';
export * from './types';

GuardianRegistry.register('laminar', LaminarGuardian as any as GuardianConstructor);

export { LaminarGuardian };
