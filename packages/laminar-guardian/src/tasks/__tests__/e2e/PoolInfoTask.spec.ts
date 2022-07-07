import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import LaminarGuardian from '../../../LaminarGuardian';
import PoolInfoTask from '../../PoolInfoTask';

describe('PoolInfoTask', () => {
  jest.setTimeout(60_000);

  const guardian = new LaminarGuardian({
    chain: 'laminar',
    network: 'dev',
    nodeEndpoint: [
      'wss://testnet-node-1.laminar-chain.laminar.one/ws',
      'wss://node-6787234140909940736.jm.onfinality.io/ws'
    ],
    monitors: []
  });

  afterAll(async () => {
    await guardian.teardown();
  });

  it('works', async () => {
    const task = new PoolInfoTask({
      poolId: 'all',
      period: 60_000
    });

    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(JSON.stringify(output, null, 2));
    expect(output).toBeTruthy();
  });
});
