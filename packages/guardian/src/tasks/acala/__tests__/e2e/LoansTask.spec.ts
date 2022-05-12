import LoansTask from '../../LoansTask';
import { AcalaGuardian } from '../../../../guardians';

describe('LoansTask e2e', () => {
  jest.setTimeout(60_000);

  const guardian = new AcalaGuardian({
    chain: 'acala',
    network: 'dev',
    nodeEndpoint: 'wss://acala-mandala.api.onfinality.io/public-ws',
    monitors: []
  });

  it('works with currencyId', async (done) => {
    const loans = new LoansTask({
      account: '5ETxc9CKrdCnxzTCf1JZGz9xur7oMaTv8GwbT2D4NyZK7uZd',
      currencyId: { token: 'DOT' }
    });

    const stream$ = await loans.start(guardian);

    stream$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });

  it('works with all', async (done) => {
    const loans = new LoansTask({
      account: '5ETxc9CKrdCnxzTCf1JZGz9xur7oMaTv8GwbT2D4NyZK7uZd',
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
