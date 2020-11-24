import { CurrencyId as LaminarCurrencyId } from '@laminar/types/interfaces';
import { CurrencyId as AcalaCurrencyId } from '@acala-network/types/interfaces';
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

  const task = new BalancesTask<LaminarCurrencyId>({
    account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    currencyId: ['FEUR'],
  });

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

  const task = new BalancesTask<AcalaCurrencyId>({
    account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    currencyId: { token: 'AUSD' },
  });

  let guardian: AcalaGuardian;
  beforeAll(() => {
    guardian = new AcalaGuardian('acala-guardian', {
      network: 'dev',
      networkType: 'acalaChain',
      nodeEndpoint: 'wss://testnet-node-1.acala.laminar.one/ws',
      monitors: {},
    });
  });

  it('get acala balance', async (done) => {
    const output$ = await task.start(guardian);

    output$.subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  });
});
