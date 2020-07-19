jest.mock('@laminar/api');

import { from, of } from 'rxjs';
import { LaminarApi } from '@laminar/api';
import { TypeRegistry } from '@polkadot/types';
import { types } from '@laminar/types';
import { customTypes } from '../../customTypes';

const register = new TypeRegistry();
register.register(types);
register.register(customTypes);

const MockLaminarApi = {
  constructor: jest.fn(),
  isReady: jest.fn(() => {
    return Promise.resolve();
  }),
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
  api: {
    query: {
      syntheticTokens: {
        positions: jest.fn(() =>
          of(
            register.createType('SyntheticPosition', {
              collateral: '2054470869988219348',
              synthetic: '1653740113770234636',
            })
          )
        ),
        ratios: jest.fn(() => of(register.createType('SyntheticTokensRatio'))),
      },
    },
    rpc: {
      oracle: {
        getValue: jest.fn(() =>
          of(register.createType('Option<TimestampedValue>', { timestamp: '12345', value: (1.1 * 1e18).toString() }))
        ),
      },
    },
  },
};

// @ts-ignore
LaminarApi.mockImplementation(() => MockLaminarApi);
