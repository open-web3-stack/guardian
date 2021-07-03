import LaminarGuardian from '../../../../guardians/LaminarGuardian';
import PositionsByTraderTask from '../../PositionsByTraderTask';

describe('PositionsByTraderTask', () => {
  const guardian = new LaminarGuardian('laminar-guardian', {
    network: 'dev',
    networkType: 'laminarChain',
    nodeEndpoint: ['wss://testnet-node-1.laminar-chain.laminar.one/ws'],
    monitors: {},
  });

  it('works with account', async (done) => {
    const task = new PositionsByTraderTask({
      account: '5FySxAHYXDzgDY8BTVnbZ6dygkXJwG27pKmgCLeSRSFEG2dy',
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
      account: ['5FySxAHYXDzgDY8BTVnbZ6dygkXJwG27pKmgCLeSRSFEG2dy'],
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
