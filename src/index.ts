import { Config } from './types';
import validateConfig from './validate-config';
import LaminarGuardian from './LaminarGuardian';
import EthereumGuardian from './EthereumGuardian';
import AcalaGuardian from './AcalaGuardian';

const guardian = (config: Config) => {
  config = validateConfig(config);

  const guardians = Object.entries(config.guardians).map(([name, guardianConfig]) => {
    switch (guardianConfig.networkType) {
      case 'laminarChain':
        return new LaminarGuardian(name, guardianConfig);
      case 'acalaChain':
        return new AcalaGuardian(name, guardianConfig);
      case 'ethereum':
        return new EthereumGuardian(name, guardianConfig);
      default:
        throw Error('network type is invalid');
    }
  });

  guardians.forEach((guardian) => guardian.start());

  process.on('SIGINT', () => {
    process.exit();
  });

  // Start reading from stdin so we don't exit.
  process.stdin.resume();
};

export default guardian;
