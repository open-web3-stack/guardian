import PoolsTask from '../../PoolsTask';
import { AcalaGuardian } from '../../../../guardians';

describe('PoolsTask e2e', () => {
  jest.setTimeout(60_000);

  const guardian = new AcalaGuardian('acala-guardian', {
    network: 'dev',
    networkType: 'acalaChain',
    nodeEndpoint: 'wss://node-6684611762228215808.jm.onfinality.io/ws',
    monitors: {},
  });

  it('works with currencyId', async (done) => {
    const loans = new PoolsTask({
      currencyId: 'DOT',
    });

    const output$ = await loans.start(guardian);

    output$.subscribe((autput) => {
      console.log(autput);
      expect(autput).toBeTruthy();
      done();
    });
  });

  it('works with currencyIds', async (done) => {
    const loans = new PoolsTask({
      currencyId: ['ACA'],
    });

    const output$ = await loans.start(guardian);

    output$.subscribe((autput) => {
      console.log(autput);
      expect(autput).toBeTruthy();
      done();
    });
  });

  it('works with all', async (done) => {
    const loans = new PoolsTask({
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
