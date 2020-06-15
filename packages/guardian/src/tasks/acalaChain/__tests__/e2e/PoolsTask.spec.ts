import createAcalaApi from '../../createAcalaApi';
import PoolsTask from '../../PoolsTask';

describe('PoolsTask e2e', () => {
  jest.setTimeout(60_000);
  const api$ = createAcalaApi(['ws://localhost:9944', 'wss://testnet-node-1.acala.laminar.one/ws']);

  it('works with currencyId', (done) => {
    const loans = new PoolsTask(api$);
    loans
      .run({
        currencyId: 'DOT',
      })
      .subscribe((autput) => {
        console.log(autput);
        expect(autput).toBeTruthy();
        done();
      });
  });

  it('works with all', (done) => {
    const loans = new PoolsTask(api$);
    loans
      .run({
        currencyId: 'all',
      })
      .subscribe((autput) => {
        console.log(autput);
        expect(autput).toBeTruthy();
        done();
      });
  });
});
