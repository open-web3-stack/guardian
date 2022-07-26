import { take } from 'rxjs/operators';
import LaminarGuardian from '../../../LaminarGuardian';
import TraderInfoTask from '../../TraderInfoTask';

describe('TraderInfoTask', () => {
  jest.setTimeout(30_000);

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
    const task = new TraderInfoTask({
      account: '5GmfNisGuwvwoyaZJyr2LX7ebyBf5pCz7cqeTDqoP6okQg1Y',
      poolId: 'all',
      period: 30_000
    });
    const output$ = await task.start(guardian);
    return new Promise<void>((resolve) => {
      output$.pipe(take(1)).subscribe((output) => {
        console.log(output);
        expect(output).toBeTruthy();
        resolve();
      });
    });
  });
});
