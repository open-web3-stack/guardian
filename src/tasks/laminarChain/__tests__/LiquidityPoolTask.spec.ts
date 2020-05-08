import { Observable, from } from 'rxjs';
import mockLaminarApi from '../../../__tests__/__mocks__/mockLaminarApi';
import LiquidityPoolTask from '../LiquidityPoolTask';
import createLaminarApi from '../createLaminarApi';

describe('LiquidityPool', () => {
  mockLaminarApi({
    synthetic: {
      allPoolIds: jest.fn(() => from([[1]])),
      poolInfo: jest.fn((poolId) => {
        return from([
          {
            poolId,
            owners: 'who',
            balance: '1000',
            options: [
              {
                additionalCollateralRatio: 1,
                askSpread: 1,
                bidSpread: 1,
                syntheticEnabled: true,
                tokenId: 'FEUR',
              },
              {
                additionalCollateralRatio: 2,
                askSpread: 2,
                bidSpread: 2,
                syntheticEnabled: true,
                tokenId: 'LAMI',
              },
            ],
          },
        ]);
      }),
    },
  });

  const api$ = createLaminarApi('ws://localhost:9944');
  const task = new LiquidityPoolTask(api$);

  it('works with valid arguments', () => {
    expect(task.call({ poolId: 1, currencyId: 'all' })).toBeInstanceOf(Observable);
    expect(task.call({ poolId: [1], currencyId: 'all' })).toBeInstanceOf(Observable);
    expect(task.call({ poolId: 'all', currencyId: 'all' })).toBeInstanceOf(Observable);
  });

  it("doesn't work with invalid arguments", () => {
    // @ts-ignore
    expect(() => task.call({ poolId: '' })).toThrow(Error);
    // @ts-ignore
    expect(() => task.call()).toThrow(Error);
  });

  it('subscription works', (done) => {
    task.call({ poolId: 'all', currencyId: 'fTokens' }).subscribe((output) => {
      expect(output).toStrictEqual({
        poolId: 1,
        owners: 'who',
        balance: '1000',
        additionalCollateralRatio: 1,
        askSpread: 1,
        bidSpread: 1,
        syntheticEnabled: true,
        tokenId: 'FEUR',
      });
      done();
    });
  });
});
