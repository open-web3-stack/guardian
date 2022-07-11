import './__mocks__/mockApiRx';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import LoansTask from '../LoansTask';
import AcalaGuardian from '../../AcalaGuardian';

describe('LoansTask', () => {
  const guardian = new AcalaGuardian({
    chain: 'acala',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: []
  });

  afterAll(async () => {
    await guardian.teardown();
  });

  const task = new LoansTask({
    account: 't6X8qpY26nsi6WDMkhbyaTz6cLtNBt7xfs4H9k94D3kM1Lm',
    currencyId: { token: 'DOT' }
  });

  it('works with mock', async () => {
    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    expect(output).toStrictEqual({
      account: 't6X8qpY26nsi6WDMkhbyaTz6cLtNBt7xfs4H9k94D3kM1Lm',
      currencyId: '{"token":"DOT"}',
      debits: '2500000000000000',
      debitsUSD: '250000000000000',
      collaterals: '10000000000',
      collateralRatio: '1.2'
    });
  });
});
