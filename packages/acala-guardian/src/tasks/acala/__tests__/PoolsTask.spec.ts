import './__mocks__/mockApiRx';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import PoolsTask from '../PoolsTask';
import AcalaGuardian from '../../../AcalaGuardian';

describe('PoolsTask', () => {
  const guardian = new AcalaGuardian({
    chain: 'acala',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: []
  });

  afterAll(async () => {
    await guardian.teardown();
  });

  const task = new PoolsTask({
    currencyId: { token: 'DOT' }
  });

  it('works with mock', async () => {
    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    expect(output).toStrictEqual({
      currencyId: '[{"token":"AUSD"},{"token":"DOT"}]',
      price: '2500000000000000',
      baseLiquidity: '100000000000000000000',
      otherLiquidity: '400000000000000000000'
    });
  });
});
