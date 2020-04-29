import LaminarGuardian from './LaminarGuardian';
import EthereumGuardian from './EthereumGuardian';

const guardian = (config: any) => {
  Object.values(config['guardians'] as any[])
    .map((g) => {
      const networkType = g['network-type'];
      switch (networkType) {
        case 'laminarChain':
          return new LaminarGuardian(g);
        case 'ethereum':
          return new EthereumGuardian(g);
        default:
          throw Error('network type is invalid');
      }
    })
    .forEach((guardian) => guardian.start());

  process.on('SIGINT', () => {
    process.exit();
  });

  // Start reading from stdin so we don't exit.
  process.stdin.resume();
};

export default guardian;
