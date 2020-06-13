import mockLoan from './__mocks__/mockLoan';
mockLoan();

import LoansTask from '../LoansTask';
import createAcalaApi from '../createAcalaApi';

describe('LoansTaksMock', () => {
  const api$ = createAcalaApi(['ws://localhost:9944']);
  it('works with mock', (done) => {
    new LoansTask(api$)
      .run({
        account: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG',
        currencyId: 'DOT',
      })
      .subscribe((output) => {
        expect(output).toStrictEqual({
          account: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG',
          currencyId: 'DOT',
          debits: '1995229380509623964735',
          debitsUSD: '200.006517',
          collaterals: '1000000000000000000',
          collateralRatio: '1.499951',
        });
        done();
      });
  });
});
