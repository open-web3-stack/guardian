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
  currencies: {
    tokens: jest.fn(() =>
      of([
        {
          name: 'LAMI',
          symbol: 'LAMI',
          precision: 18,
          isBaseToken: false,
          isNetworkToken: true,
          id: 'LAMI',
        },
        {
          name: 'USD',
          symbol: 'AUSD',
          precision: 18,
          isBaseToken: true,
          isNetworkToken: false,
          id: 'AUSD',
        },
        {
          name: 'EUR',
          symbol: 'FEUR',
          precision: 18,
          isBaseToken: false,
          isNetworkToken: false,
          id: 'FEUR',
        },
        {
          name: 'JPY',
          symbol: 'FJPY',
          precision: 18,
          isBaseToken: false,
          isNetworkToken: false,
          id: 'FJPY',
        },
        {
          name: 'BTC',
          symbol: 'FBTC',
          precision: 18,
          isBaseToken: false,
          isNetworkToken: false,
          id: 'FBTC',
        },
        {
          name: 'ETH',
          symbol: 'FETH',
          precision: 18,
          isBaseToken: false,
          isNetworkToken: false,
          id: 'FETH',
        },
        {
          name: 'AUD',
          symbol: 'FAUD',
          precision: 18,
          isBaseToken: false,
          isNetworkToken: false,
          id: 'FAUD',
        },
        {
          name: 'CAD',
          symbol: 'FCAD',
          precision: 18,
          isBaseToken: false,
          isNetworkToken: false,
          id: 'FCAD',
        },
        {
          name: 'CHF',
          symbol: 'FCHF',
          precision: 18,
          isBaseToken: false,
          isNetworkToken: false,
          id: 'FCHF',
        },
        {
          name: 'XAU',
          symbol: 'FXAU',
          precision: 18,
          isBaseToken: false,
          isNetworkToken: false,
          id: 'FXAU',
        },
        {
          name: 'OIL',
          symbol: 'FOIL',
          precision: 18,
          isBaseToken: false,
          isNetworkToken: false,
          id: 'FOIL',
        }, // {
        //   name: 'FGBP',
        //   symbol: 'GBP',
        //   precision: 18,
        //   isBaseToken: false,
        //   isNetworkToken: false,
        //   id: 'FGBP'
        // }
      ])
    ),
  },
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
    createType: jest.fn(() => register.createType('TradingPair', { base: 'FEUR', quote: 'AUSD' })),
    consts: {},
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
      margin: {
        poolState: jest.fn(() => of(register.createType('MarginPoolState', { enp: 100, ell: 100 }))),
      },
    },
  },
};

// @ts-ignore
LaminarApi.mockImplementation(() => MockLaminarApi);

import '../../tasks/laminarChain/__tests__/__mocks__/mockPools';
