import LoansTask from '../../LoansTask';
import { AcalaGuardian } from '../../../../guardians';

describe('LoansTaks e2e', () => {
  jest.setTimeout(60_000);

  const guardian = new AcalaGuardian('acala-guardian', {
    network: 'dev',
    networkType: 'acalaChain',
    nodeEndpoint: 'wss://testnet-node-1.acala.laminar.one/ws',
    monitors: {},
  });

  it('works with currencyId', async (done) => {
    const loans = new LoansTask({
      account: '5DrAKb6enqoZv2yUnE44WXnCMAWCMuBx3t8LGseHhh9L4ti2',
      currencyId: { token: 'XBTC' },
    });

    const output$ = await loans.start(guardian);

    output$.subscribe((autput) => {
      console.log(autput);
      expect(autput).toBeTruthy();
      done();
    });
  });

  it('works with all', async (done) => {
    const loans = new LoansTask({
      account: '5DrAKb6enqoZv2yUnE44WXnCMAWCMuBx3t8LGseHhh9L4ti2',
      currencyId: 'all',
    });

    const output$ = await loans.start(guardian);

    output$.subscribe((autput) => {
      console.log(autput);
      expect(autput).toBeTruthy();
      done();
    });
  });
});
