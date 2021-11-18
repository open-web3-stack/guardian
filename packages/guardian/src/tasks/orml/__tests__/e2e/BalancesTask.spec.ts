import BalancesTask from '../../BalancesTask';
import { AcalaGuardian, LaminarGuardian } from '../../../../guardians';

describe('BalancesTask with laminarChain', () => {
  jest.setTimeout(60_000);

  const guardian = new LaminarGuardian({
    chain: 'laminar',
    network: 'dev',
    nodeEndpoint: [
      'wss://testnet-node-1.laminar-chain.laminar.one/ws',
      'wss://node-6787234140909940736.jm.onfinality.io/ws'
    ],
    monitors: {}
  });

  const task = new BalancesTask({
    account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    currencyId: ['FEUR']
  });

  it('get laminar balance', async (done) => {
    const stream$ = await task.start(guardian);

    stream$.subscribe((output) => {
      console.log(JSON.stringify(output, null, 2));
      expect(output).toBeTruthy();
      done();
    });
  });
});

describe('BalancesTask with acalaChain', () => {
  jest.setTimeout(60_000);

  const task = new BalancesTask({
    account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    currencyId: { token: 'AUSD' }
  });

  let guardian: AcalaGuardian;
  beforeAll(() => {
    guardian = new AcalaGuardian({
      chain: 'acala',
      network: 'dev',
      nodeEndpoint: ['wss://karura-rpc-0.aca-api.network', 'wss://karura-rpc-1.aca-api.network'],
      monitors: {}
    });
  });

  it('get acala balance', async (done) => {
    const stream$ = await task.start(guardian);

    stream$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });
});
