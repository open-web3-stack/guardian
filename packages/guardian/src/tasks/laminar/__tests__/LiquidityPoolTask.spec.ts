import './__mocks__/mockPools';

import { LaminarGuardian } from '@open-web3/guardian';
import LiquidityPoolTask from '../LiquidityPoolTask';

describe('LiquidityPoolTask', () => {
  jest.setTimeout(30_000);

  const guardian = new LaminarGuardian({
    chain: 'laminar',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: {}
  });

  const task = new LiquidityPoolTask({
    poolId: 0,
    currencyId: 'all'
  });

  it('works with mock', async (done) => {
    const output$ = await task.start(guardian);
    output$.subscribe((result) => {
      expect(result).toStrictEqual({
        poolId: '0',
        currencyId: 'FEUR',
        owner: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
        liquidity: '1000',
        askSpread: '20',
        bidSpread: '10',
        additionalCollateralRatio: '50',
        enabled: true,
        collateralRatio: '1.03526487872409687163',
        syntheticIssuance: '1653740113770234636',
        collateralBalance: '2054470869988219348',
        isSafe: false
      });
      done();
    });
  });
});
