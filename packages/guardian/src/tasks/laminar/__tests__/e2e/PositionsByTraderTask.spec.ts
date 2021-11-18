import LaminarGuardian from '../../../../guardians/LaminarGuardian';
import PositionsByTraderTask from '../../PositionsByTraderTask';

describe('PositionsByTraderTask', () => {
  const guardian = new LaminarGuardian({
    chain: 'laminar',
    network: 'dev',
    nodeEndpoint: [
      'wss://testnet-node-1.laminar-chain.laminar.one/ws',
      'wss://node-6787234140909940736.jm.onfinality.io/ws'
    ],
    monitors: {}
  });

  it('works with account', async (done) => {
    const task = new PositionsByTraderTask({
      account: '5FySxAHYXDzgDY8BTVnbZ6dygkXJwG27pKmgCLeSRSFEG2dy'
    });

    const output$ = await task.start(guardian);

    output$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  }, 30_000);

  it('works with multiple accounts', async (done) => {
    const task = new PositionsByTraderTask({
      account: ['5FySxAHYXDzgDY8BTVnbZ6dygkXJwG27pKmgCLeSRSFEG2dy']
    });

    const output$ = await task.start(guardian);

    output$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      if (output.profit) {
        done();
      }
    });
  }, 30_000);
});
