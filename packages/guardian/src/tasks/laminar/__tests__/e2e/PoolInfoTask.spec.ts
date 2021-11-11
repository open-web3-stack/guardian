import LaminarGuardian from '../../../../guardians/LaminarGuardian';
import PoolInfoTask from '../../PoolInfoTask';

describe('PoolInfoTask', () => {
  jest.setTimeout(60_000);

  const guardian = new LaminarGuardian('laminar-guardian', {
    network: 'dev',
    networkType: 'laminarChain',
    nodeEndpoint: [
      'wss://testnet-node-1.laminar-chain.laminar.one/ws',
      'wss://node-6787234140909940736.jm.onfinality.io/ws'
    ],
    monitors: {}
  });

  it('works', async (done) => {
    const task = new PoolInfoTask({
      poolId: 'all',
      period: 60_000
    });

    const output$ = await task.start(guardian);

    output$.subscribe((output) => {
      console.log(JSON.stringify(output, null, 2));
      expect(output).toBeTruthy();
      done();
    });
  });
});
