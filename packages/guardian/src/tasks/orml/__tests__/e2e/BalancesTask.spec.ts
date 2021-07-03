import BalancesTask from '../../BalancesTask';
import { AcalaGuardian, LaminarGuardian } from '../../../../guardians';

describe('BalancesTask with laminarChain', () => {
  jest.setTimeout(60_000);

  const guardian = new LaminarGuardian('laminar-guardian', {
    network: 'dev',
    networkType: 'laminarChain',
    nodeEndpoint: ['wss://testnet-node-1.laminar-chain.laminar.one/ws'],
    monitors: {},
  });

  const task = new BalancesTask({
    account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    currencyId: ['FEUR'],
  });

  it('get laminar balance', async (done) => {
    const output$ = await task.start(guardian as any);

    output$.subscribe((output) => {
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
    currencyId: { token: 'AUSD' },
  });

  let guardian: AcalaGuardian;
  beforeAll(() => {
    guardian = new AcalaGuardian('acala-guardian', {
      network: 'dev',
      networkType: 'acalaChain',
      nodeEndpoint: 'wss://acala-mandala.api.onfinality.io/public-ws',
      monitors: {},
    });
  });

  it('get acala balance', async (done) => {
    const output$ = await task.start(guardian as any);

    output$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });
});
