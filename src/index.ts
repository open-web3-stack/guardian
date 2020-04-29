import validateConfig from './validate-config';
import LaminarGuardian from './LaminarGuardian';
import EthereumGuardian from './EthereumGuardian';

const guardian = (config: any) => {
  config = validateConfig(config);

  const guardians = Object.values(config['guardians'] as any[]).map((guardianConfig) => {
    const networkType = guardianConfig['networkType'];
    switch (networkType) {
      case 'laminarChain':
        return new LaminarGuardian(guardianConfig);
      case 'ethereum':
        return new EthereumGuardian(guardianConfig);
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
