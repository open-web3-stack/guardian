import createAcalaApi from '../../createAcalaApi';
import InterestsTask from '../../InterestsTask';

describe('InterestsTask e2e', () => {
  jest.setTimeout(60_000);
  const api$ = createAcalaApi(['ws://localhost:9944', 'wss://testnet-node-1.acala.laminar.one/ws']);

  it('works with currencyId', (done) => {
    const loans = new InterestsTask(api$);
    loans
      .run({
        account: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG',
        currencyId: 'DOT',
      })
      .subscribe((autput) => {
        console.log(autput);
        expect(autput).toBeTruthy();
        done();
      });
  });

  it('works with all', (done) => {
    const loans = new InterestsTask(api$);
    loans
      .run({
        account: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG',
        currencyId: 'all',
      })
      .subscribe((autput) => {
        console.log(autput);
        expect(autput).toBeTruthy();
        done();
      });
  });
});
