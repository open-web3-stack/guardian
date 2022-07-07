import { GuardianRegistry } from '@open-web3/guardian';
import LaminarGuardian from './LaminarGuardian';

GuardianRegistry.register('laminar', LaminarGuardian as any);

export { LaminarGuardian };
