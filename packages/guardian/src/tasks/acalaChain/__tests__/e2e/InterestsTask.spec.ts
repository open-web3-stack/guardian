import InterestsTask from '../../InterestsTask';
import { AcalaGuardian } from '../../../../guardians';

describe('InterestsTask e2e', async () => {
  jest.setTimeout(60_000);

  const guardian = new AcalaGuardian('acala-guardian', {
    network: 'dev',
    networkType: 'acalaChain',
    nodeEndpoint: ['ws://localhost:9944', 'wss://node-6684611762228215808.jm.onfinality.io/ws'],
    monitors: {},
  });

  it('works with currencyId', async (done) => {
    const loans = new InterestsTask({
      account: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG',
      currencyId: 'DOT',
    });
    const output$ = await loans.start(guardian);
    output$.subscribe((autput) => {
      console.log(autput);
      expect(autput).toBeTruthy();
      done();
    });
  });

  it('works with all', async (done) => {
    const loans = new InterestsTask({
      account: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG',
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
