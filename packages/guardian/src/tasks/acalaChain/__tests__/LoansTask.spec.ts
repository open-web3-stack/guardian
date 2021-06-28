import './__mocks__/mockLoan';

import LoansTask from '../LoansTask';
import { AcalaGuardian } from '../../../guardians';

describe('LoansTask', () => {
  const guardian = new AcalaGuardian('acala-guardian', {
    networkType: 'acalaChain',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: {},
  });

  const task = new LoansTask({
    account: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG',
    currencyId: { token: 'DOT' },
  });

  it('works with mock', async (done) => {
    const output$ = await task.start(guardian);

    output$.subscribe((output) => {
      expect(output).toStrictEqual({
        account: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG',
        currencyId: '{"token":"DOT"}',
        debits: '2500000000000000',
        debitsUSD: '250000000000000',
        collaterals: '10000000000',
        collateralRatio: '1.2',
      });
      done();
    });
  });
});
