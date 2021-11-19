import PoolsTask from '../../PoolsTask';
import { AcalaGuardian } from '../../../../guardians';

describe('PoolsTask e2e', () => {
  jest.setTimeout(60_000);

  const guardian = new AcalaGuardian({
    chain: 'acala',
    network: 'dev',
    nodeEndpoint: 'wss://acala-mandala.api.onfinality.io/public-ws',
    monitors: []
  });

  it('works with currencyId', async (done) => {
    const loans = new PoolsTask({
      currencyId: { token: 'DOT' }
    });

    const stream$ = await loans.start(guardian);

    stream$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });

  it('works with currencyIds', async (done) => {
    const loans = new PoolsTask({
      currencyId: [{ token: 'ACA' }, { token: 'DOT' }, { token: 'RENBTC' }]
    });

    const stream$ = await loans.start(guardian);

    stream$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });

  it('works with all', async (done) => {
    const loans = new PoolsTask({
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
