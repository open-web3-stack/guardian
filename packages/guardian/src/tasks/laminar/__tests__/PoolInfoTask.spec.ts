import './__mocks__/mockPools';

import { LaminarGuardian } from '@open-web3/guardian';
import PoolInfoTask from '../PoolInfoTask';

describe('PoolInfoTask', () => {
  jest.setTimeout(30_000);

  const guardian = new LaminarGuardian({
    chain: 'laminar',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: []
  });

  const task = new PoolInfoTask({
    poolId: 0,
    period: 60_000
  });

  it('works with mock', async (done) => {
    const output$ = await task.start(guardian);
    output$.subscribe((result) => {
      expect(result).toStrictEqual({
        poolId: '0',
        owner: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
        balance: '1000',
        enp: '100',
        ell: '100',
        options: [
          {
            pair: {
              base: 'FEUR',
              quote: 'AUSD'
            },
            pairId: 'FEURAUSD',
            enabledTrades: ['LongTwo', 'ShortTwo'],
            askSpread: '10',
            bidSpread: '10'
          }
        ],
        minLeveragedAmount: '0'
      });
      done();
    });
  });
});
