jest.mock('@laminar/api');

import { from } from 'rxjs';
import { LaminarApi } from '@laminar/api';

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
          ],
        },
        {
          poolId,
          owners: 'who',
          balance: '1200',
          options: [
            {
              additionalCollateralRatio: 1,
              askSpread: 1,
              bidSpread: 1,
              syntheticEnabled: true,
              tokenId: 'FEUR',
            },
          ],
        },
      ]);
    }),
  },
};

export default () => {
  // @ts-ignore
  LaminarApi.mockImplementation(() => MockLaminarApi);
};
