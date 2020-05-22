import LaminarGuardian from './LaminarGuardian';
import EthereumGuardian from './EthereumGuardian';
import AcalaGuardian from './AcalaGuardian';
import SubstrateGuardian from './SubstrateGuardian';
import GuardianRegistry from './GuardianRegistry';

export { GuardianRegistry, EthereumGuardian, LaminarGuardian, AcalaGuardian, SubstrateGuardian };

export const registerGuardians = () => {
  GuardianRegistry.register('ethereum', EthereumGuardian);
  GuardianRegistry.register('laminarChain', LaminarGuardian);
  GuardianRegistry.register('acalaChain', AcalaGuardian);
  GuardianRegistry.register('substrateChain', SubstrateGuardian);
};
