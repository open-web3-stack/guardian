import './__mocks__/mockApiRx';

import LoansTask from '../LoansTask';
import { AcalaGuardian } from '../../../guardians';

describe('LoansTask', () => {
  const guardian = new AcalaGuardian({
    chain: 'acala',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: []
  });

  const task = new LoansTask({
    account: 't6X8qpY26nsi6WDMkhbyaTz6cLtNBt7xfs4H9k94D3kM1Lm',
    currencyId: { token: 'DOT' }
  });

  it('works with mock', async (done) => {
    const output$ = await task.start(guardian);

    output$.subscribe((output) => {
      expect(output).toStrictEqual({
        account: 't6X8qpY26nsi6WDMkhbyaTz6cLtNBt7xfs4H9k94D3kM1Lm',
        currencyId: '{"token":"DOT"}',
        debits: '2500000000000000',
        debitsUSD: '250000000000000',
        collaterals: '10000000000',
        collateralRatio: '1.2'
      });
      done();
    });
  });
});
