import './__mocks__/mockPools';

import { LaminarGuardian } from '@open-web3/guardian';
import LiquidityPoolTask from '../LiquidityPoolTask';

describe('LiquidityPoolTask', () => {
  jest.setTimeout(30_000);

  const guardian = new LaminarGuardian('laminar-guardian', {
    networkType: 'laminarChain',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: {},
  });

  const task = new LiquidityPoolTask({
    poolId: 0,
    currencyId: 'all',
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
