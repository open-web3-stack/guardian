import PricesTask from '../../PricesTask';
import { LaminarGuardian } from '../../../../guardians';

describe('PricesTask', () => {
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

  it('get oracle value', async (done) => {
    const task = new PricesTask({ key: 'FEUR', period: 1000 });
    const output$ = await task.start(guardian as any);
    output$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });

  it('get oracle values [FEUR, FJPY]', async (done) => {
    const task = new PricesTask({ key: ['FEUR', 'FJPY'], period: 1000 });
    const output$ = await task.start(guardian as any);
    output$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });

  it('get all oracle values', async (done) => {
    const task = new PricesTask({ key: 'all', period: 1000 });
    const output$ = await task.start(guardian as any);
    output$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });
});
