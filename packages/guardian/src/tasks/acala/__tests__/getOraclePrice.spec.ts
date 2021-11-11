import './__mocks__/mockApiRx';

import { TestScheduler } from 'rxjs/testing';
import { ApiRx } from '@polkadot/api';
import { types } from '@acala-network/types';
import { firstValueFrom } from 'rxjs';
import getOraclePrice from '../helpers/getOraclePrice';

const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

describe('getOraclePrice', () => {
  let apiRx: ApiRx;

  beforeAll(async () => {
    apiRx = await firstValueFrom(ApiRx.create({ types }));
  });

  it('fetch price', () => {
    testScheduler.run(({ expectObservable }) => {
      const DOT = apiRx.createType('CurrencyId', { token: 'DOT' });

      const stream$ = getOraclePrice(apiRx)(DOT);

      expectObservable(stream$).toBe('a 999ms (b|)', {
        a: 300e18,
        b: 280e18
      });
    });
  });
});
