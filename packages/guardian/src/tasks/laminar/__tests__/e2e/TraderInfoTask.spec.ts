import LaminarGuardian from '../../../../guardians/LaminarGuardian';
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
    monitors: {}
  });

  it('works', async (done) => {
    const task = new TraderInfoTask({
      account: '5GmfNisGuwvwoyaZJyr2LX7ebyBf5pCz7cqeTDqoP6okQg1Y',
      poolId: 'all',
      period: 30_000
    });

    const output$ = await task.start(guardian);

    output$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });
});
