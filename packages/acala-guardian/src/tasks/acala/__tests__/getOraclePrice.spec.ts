import './__mocks__/mockApiRx';

import { firstValueFrom } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { ApiRx } from '@polkadot/api';
import { options } from '@acala-network/api';
import getOraclePrice from '../helpers/getOraclePrice';

const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

describe('getOraclePrice', () => {
  let apiRx: ApiRx;

  beforeAll(async () => {
    apiRx = await firstValueFrom(ApiRx.create(options()));
  });

  it('fetch price', () => {
    testScheduler.run(({ expectObservable }) => {
      const DOT = apiRx.createType('CurrencyId', { token: 'DOT' });

      const stream$ = getOraclePrice(apiRx)(DOT as any);

      expectObservable(stream$).toBe('a 999ms (b|)', {
        a: 300e18,
        b: 280e18
      });
    });
  });
});
