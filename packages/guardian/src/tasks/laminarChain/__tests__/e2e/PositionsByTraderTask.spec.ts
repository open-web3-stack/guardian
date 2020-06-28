import createLaminarApi from '../../createLaminarApi';
import PositionsByTraderTask from '../../PositionsByTraderTask';

describe('PositionsByTraderTask', () => {
  jest.setTimeout(60_000);
  const api$ = createLaminarApi(['wss://testnet-node-1.laminar-chain.laminar.one/ws']);
  const task = new PositionsByTraderTask(api$);

  it('works with account', (done) => {
    task
      .run({
        account: '5EkTxjD5K75Z7T7tb6oREeoLt82MygJJP2oJ6DFF4weLt28D',
      })
      .subscribe((autput) => {
        console.log(autput);
        expect(autput).toBeTruthy();
        done();
      });
  });

  it('works with accounts', (done) => {
    task
      .run({
        account: ['5EkTxjD5K75Z7T7tb6oREeoLt82MygJJP2oJ6DFF4weLt28D'],
      })
      .subscribe((autput) => {
        console.log(autput);
        expect(autput).toBeTruthy();
        done();
      });
  });
});
