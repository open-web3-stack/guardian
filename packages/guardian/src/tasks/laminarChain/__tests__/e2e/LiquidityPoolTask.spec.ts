import createLaminarApi from '../../createLaminarApi';
import LiquidityPoolTask from '../../LiquidityPoolTask';

describe('LiquidityPoolTask', () => {
  jest.setTimeout(60_000);
  const api$ = createLaminarApi(['wss://testnet-node-1.laminar-chain.laminar.one/ws']);

  it('works with poolId', (done) => {
    new LiquidityPoolTask(api$)
      .run({
        poolId: '0',
        currencyId: 'all',
      })
      .subscribe((autput) => {
        console.log(autput);
        expect(autput).toBeTruthy();
        done();
      });
  });

  it('works with poolId and currencyId', (done) => {
    new LiquidityPoolTask(api$)
      .run({
        poolId: '0',
        currencyId: 'FEUR',
      })
      .subscribe((autput) => {
        console.log(autput);
        expect(autput).toBeTruthy();
        done();
      });
  });

  it('works with poolId and currencyIds', (done) => {
    new LiquidityPoolTask(api$)
      .run({
        poolId: '0',
        currencyId: ['FEUR', 'FJPY'],
      })
      .subscribe((autput) => {
        console.log(autput);
        expect(autput).toBeTruthy();
        done();
      });
  });

  it('works with poolId and fTokens', (done) => {
    new LiquidityPoolTask(api$)
      .run({
        poolId: '0',
        currencyId: 'fTokens',
      })
      .subscribe((autput) => {
        console.log(autput);
        expect(autput).toBeTruthy();
        done();
      });
  });
});
