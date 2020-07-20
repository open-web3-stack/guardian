import PricesTask from '../../PricesTask';
import { LaminarGuardian } from '../../../../guardians';

describe('PricesTask', async () => {
  jest.setTimeout(30_000);

  const guardian = new LaminarGuardian('laminar-guardian', {
    network: 'dev',
    networkType: 'laminarChain',
    nodeEndpoint: ['ws://localhost:9944', 'wss://testnet-node-1.laminar-chain.laminar.one/ws'],
    monitors: {},
  });

  it('get oracle value', async (done) => {
    const task = new PricesTask({ key: 'FEUR' });
    const output$ = await task.start(guardian);
    output$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });

  it('get oracle values [FEUR, FJPY]', async (done) => {
    const task = new PricesTask({ key: ['FEUR', 'FJPY'] });
    const output$ = await task.start(guardian);
    output$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });

  it('get all oracle values', async (done) => {
    const task = new PricesTask({ key: 'all' });
    const output$ = await task.start(guardian);
    output$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });
});
