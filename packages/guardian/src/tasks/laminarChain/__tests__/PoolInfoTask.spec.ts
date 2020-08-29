import '../../../__tests__/__mocks__/mockLaminarApi';

import { LaminarGuardian } from '@open-web3/guardian';
import PoolInfoTask from '../PoolInfoTask';

describe('PoolInfoTask', () => {
  jest.setTimeout(30_000);

  const guardian = new LaminarGuardian('laminar-guardian', {
    networkType: 'laminarChain',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: {},
  });

  const task = new PoolInfoTask({
    poolId: 0,
    period: 60_000,
  });

  it('works with mock', async (done) => {
    const output$ = await task.start(guardian);
    output$.subscribe((result) => {
      console.log(result);
      expect(result).toBeTruthy();
      done();
    });
  });
});
