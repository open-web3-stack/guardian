import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import LaminarGuardian from '../../../LaminarGuardian';
import PositionsByTraderTask from '../../PositionsByTraderTask';

describe('PositionsByTraderTask', () => {
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

  it('works with account', async () => {
    const task = new PositionsByTraderTask({
      account: '5FySxAHYXDzgDY8BTVnbZ6dygkXJwG27pKmgCLeSRSFEG2dy'
    });
    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output);
    expect(output).toBeTruthy();
  }, 30_000);

  it('works with multiple accounts', async () => {
    const task = new PositionsByTraderTask({
      account: ['5FySxAHYXDzgDY8BTVnbZ6dygkXJwG27pKmgCLeSRSFEG2dy']
    });
    const output$ = await task.start(guardian);
    return new Promise<void>((resolve) => {
      const sub = output$.subscribe((output) => {
        console.log(output);
        expect(output).toBeTruthy();
        if (output.profit) {
          sub.unsubscribe();
          resolve();
        }
      });
    });
  }, 30_000);
});
