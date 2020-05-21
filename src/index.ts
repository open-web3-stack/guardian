import { Config } from './types';
import validateConfig from './validate-config';
import { EthereumGuardian, LaminarGuardian, AcalaGuardian, SubstrateGuardian } from './guardians';

const guardian = (config: Config) => {
  config = validateConfig(config);

  const guardians = Object.entries(config.guardians).map(([name, guardianConfig]) => {
    switch (guardianConfig.networkType) {
      case 'laminarChain':
        return new LaminarGuardian(name, guardianConfig);
      case 'acalaChain':
        return new AcalaGuardian(name, guardianConfig);
      case 'substrateChain':
        return new SubstrateGuardian(name, guardianConfig);
      case 'ethereum':
        return new EthereumGuardian(name, guardianConfig);
      default:
        throw Error('network type is invalid');
    }
  });

  guardians.forEach((guardian) => guardian.start());

  return () => {
    guardians.forEach((guardian) => guardian.stop());
  };
};

export default guardian;
