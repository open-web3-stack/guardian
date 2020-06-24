jest.mock('@laminar/api');

import { from, of } from 'rxjs';
import { LaminarApi } from '@laminar/api';
import { TypeRegistry } from '@polkadot/types';
import { types } from '@laminar/types';

const register = new TypeRegistry();
register.register(types);

const MockLaminarApi = {
  constructor: jest.fn(),
  isReady: jest.fn(() => Promise.resolve()),
  margin: {
    poolInfo: jest.fn((poolId) => {
      return from([
        {
          poolId,
          owners: 'asf',
          balance: '100',
          ell: '80',
          enp: '50',
        },
      ]);
    }),
  },
  synthetic: {
    allPoolIds: jest.fn(() => of([1])),
    poolInfo: jest.fn((poolId) =>
      of({
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
        ],
      })
    ),
  },
  api: { query: { syntheticTokens: { ratios: jest.fn(() => of(register.createType('SyntheticTokensRatio'))) } } },
};

export default () => {
  // @ts-ignore
  LaminarApi.mockImplementation(() => MockLaminarApi);
};
