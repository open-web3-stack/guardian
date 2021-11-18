import './__mocks__/mockApiRx';

import PoolsTask from '../PoolsTask';
import { AcalaGuardian } from '../../../guardians';

describe('PoolsTask', () => {
  const guardian = new AcalaGuardian({
    chain: 'acala',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: {}
  });

  const task = new PoolsTask({
    currencyId: { token: 'DOT' }
  });

  it('works with mock', async (done) => {
    const output$ = await task.start(guardian);

    output$.subscribe((output) => {
      expect(output).toStrictEqual({
        currencyId: '[{"token":"AUSD"},{"token":"DOT"}]',
        price: '2500000000000000',
        baseLiquidity: '100000000000000000000',
        otherLiquidity: '400000000000000000000'
      });
      done();
    });
  });
});
