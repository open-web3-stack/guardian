import { of } from 'rxjs';
import { TypeRegistry } from '@polkadot/types';
import { types } from '@acala-network/types';
import { observable } from 'mobx';
import { customTypes } from '../../../../customTypes';
import { MockApiPromise } from '../../../../__tests__/__mocks__/mockApiPromise';

const register = new TypeRegistry();
register.register(types);
register.register(customTypes);

const DOT = register.createType('CurrencyId', { token: 'DOT' });

const MockApiRx = of({
  consts: {
    prices: { stableCurrencyFixedPrice: 1e18 },
    cdpEngine: {
      getStableCurrencyId: register.createType('CurrencyId', { Token: 'AUSD'}),
      collateralCurrencyIds: register.createType('Vec<CurrencyId>', [
        { token: 'DOT' },
        { token: 'LDOT' },
      ]),
    },
  },
  createType: (type: any, value: any) => register.createType(type, value),
});

const MockStorage = {
  loans: {
    positions: jest.fn(() =>
      register.createType('Position', { debit: '2500000000000000', collateral: '10000000000' })
    ),
  },
  cdpEngine: {
    debitExchangeRate: jest.fn(() => register.createType('Option<ExchangeRate>', '100000000000000000')),
  },
  acalaOracle: {
    rawValues: {
      allEntries: jest.fn(() =>
        observable.map({
          0: observable.map({
            [DOT.toString()]: register.createType('Option<TimestampedValue>', { value: '300000000000000000000' }),
          }),
        })
      ),
    },
  },
};

jest.mock('@open-web3/api-mobx', () => ({
  createStorage: jest.fn(() => MockStorage),
}));

jest.mock('@polkadot/api', () => ({
  WsProvider: jest.fn(() => {}),
  ApiPromise: { create: jest.fn(async () => MockApiPromise) },
  ApiRx: { create: jest.fn(() => MockApiRx) },
}));
