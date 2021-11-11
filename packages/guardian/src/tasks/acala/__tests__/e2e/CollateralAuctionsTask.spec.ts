import CollateralAuctionsTask from '../../CollateralAuctionsTask';
import { AcalaGuardian } from '../../../../guardians';

describe('CollateralAuctionsTask e2e', () => {
  jest.setTimeout(60_000);

  const guardian = new AcalaGuardian('acala-guardian', {
    network: 'dev',
    networkType: 'acalaChain',
    nodeEndpoint: 'wss://acala-mandala.api.onfinality.io/public-ws',
    monitors: {}
  });

  it('works with all', async (done) => {
    const loans = new CollateralAuctionsTask({
      account: 'all',
      currencyId: 'all'
    });

    const stream$ = await loans.start(guardian);

    stream$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });
});
