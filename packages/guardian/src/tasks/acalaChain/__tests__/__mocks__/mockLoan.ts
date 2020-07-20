jest.mock('@polkadot/api');

import { of } from 'rxjs';
import BN from 'bn.js';
import { ApiRx, WsProvider } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types';
import { Vec } from '@polkadot/types/codec';
import { types } from '@acala-network/types';
import { customTypes } from '../../../../customTypes';

const register = new TypeRegistry();
register.register(types);
register.register(customTypes);

const MockLoan = of({
  consts: {
    cdpTreasury: { getStableCurrencyId: 'AUSD' },
    cdpEngine: {
      collateralCurrencyIds: new (Vec.with('CurrencyId'))(register, ['DOT', 'XBTC', 'LDOT']),
    },
  },
  derive: {
    loan: {
      loan: jest.fn((account, currencyId) => {
        return of({
          account,
          token: currencyId,
          debits: new BN('1995229380509623964735'),
          collaterals: new BN('1000000000000000000'),
        });
      }),
      loanType: jest.fn((currencyId) => {
        return of({ token: currencyId, debitExchangeRate: new BN('100242367706398103') });
      }),
    },
    price: {
      price: jest.fn((currencyId) => {
        if (currencyId === 'DOT') {
          return of({ value: new BN('300000000000000000000') });
        }
        return of({ value: new BN('1000000000000000000') });
      }),
    },
  },
});

// @ts-ignore
ApiRx.create.mockImplementation(() => MockLoan);

// @ts-ignore
WsProvider.mockImplementation(() => ({
  constructor: jest.fn(),
}));

import '../../../../__tests__/__mocks__/mockApiPromise';
