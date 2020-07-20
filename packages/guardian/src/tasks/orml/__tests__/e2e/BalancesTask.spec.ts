import BalancesTask from '../../BalancesTask';
import { AcalaGuardian, LaminarGuardian } from '../../../../guardians';

describe('BalancesTask with laminarChain', () => {
  jest.setTimeout(60_000);

  const guardian = new LaminarGuardian('laminar-guardian', {
    network: 'dev',
    networkType: 'laminarChain',
    nodeEndpoint: ['ws://localhost:9944', 'wss://testnet-node-1.laminar-chain.laminar.one/ws'],
    monitors: {},
  });

  const task = new BalancesTask({ account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', currencyId: ['FEUR'] });

  it('get laminar balance', async (done) => {
    const output$ = await task.start(guardian);

    output$.subscribe((output) => {
      console.log(JSON.stringify(output, null, 2));
      expect(output).toBeTruthy();
      done();
    });
  });
});

describe('BalancesTask with acalaChain', async () => {
  jest.setTimeout(60_000);

  const guardian = new AcalaGuardian('acala-guardian', {
    network: 'dev',
    networkType: 'acalaChain',
    nodeEndpoint: 'wss://node-6684611762228215808.jm.onfinality.io/ws',
    monitors: {},
  });

  const task = new BalancesTask({ account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', currencyId: 'AUSD' });

  it('get acala balance', async (done) => {
    const output$ = await task.start(guardian);

    output$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });
});
