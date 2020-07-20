import LiquidityPoolTask from '../../LiquidityPoolTask';
import { LaminarGuardian } from '../../../../guardians';
import { LaminarGuardianConfig } from '../../../../types';

describe('LiquidityPoolTask', () => {
  jest.setTimeout(60_000);

  const config: LaminarGuardianConfig = {
    network: 'dev',
    networkType: 'laminarChain',
    nodeEndpoint: 'wss://testnet-node-1.laminar-chain.laminar.one/ws',
    monitors: {},
  };

  const guardian = new LaminarGuardian('laminar-guardian', config);

  it('works with poolId and currencyId', async (done) => {
    const task = new LiquidityPoolTask({
      poolId: 0,
      currencyId: 'FEUR',
    });

    const output$ = await task.start(guardian);

    output$.subscribe((autput) => {
      console.log(autput);
      expect(autput).toBeTruthy();
      done();
    });
  });

  it('works with poolId and currencyIds', async (done) => {
    const task = new LiquidityPoolTask({
      poolId: 0,
      currencyId: ['FEUR', 'FJPY'],
    });

    const output$ = await task.start(guardian);

    output$.subscribe((autput) => {
      console.log(autput);
      expect(autput).toBeTruthy();
      done();
    });
  });

  it('works with poolId and fTokens', async (done) => {
    const task = new LiquidityPoolTask({
      poolId: 0,
      currencyId: ['FEUR', 'FJPY'],
    });

    const output$ = await task.start(guardian);

    output$.subscribe((autput) => {
      console.log(autput);
      expect(autput).toBeTruthy();
      done();
    });
  });
});
