import { GuardianRegistry } from '@open-web3/guardian';
import AcalaGuardian from './AcalaGuardian';

GuardianRegistry.register('acala', AcalaGuardian as any);

export { AcalaGuardian };
