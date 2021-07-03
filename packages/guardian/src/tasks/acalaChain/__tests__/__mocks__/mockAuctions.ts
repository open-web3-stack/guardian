import { of } from 'rxjs';
import { TypeRegistry } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import { types } from '@acala-network/types';
import { observable } from 'mobx';
import { customTypes } from '../../../../customTypes';

const register = new TypeRegistry();
register.register(types);
register.register(customTypes);

const AUCTION = new Option(register, 'AuctionInfo', {
  bid: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', 30],
  start: 1,
  end: 125,
});

const MOCK_COLLATERAL_AUCTION = new Option(register, 'CollateralAuctionItem', {
  refundRecipient: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  currencyId: { token: 'RENBTC' },
  initialAmount: 100,
  amount: 100,
  target: 20,
  startTime: 20,
});

const MockStorage = {
  auctionManager: {
    collateralAuctions: {
      entries: jest.fn(() => observable.map({ 0: MOCK_COLLATERAL_AUCTION })),
    },
  },
  auction: {
    auctions: jest.fn(() => AUCTION),
  },
};

jest.mock('@open-web3/api-mobx', () => ({
  createStorage: jest.fn(() => MockStorage),
}));

jest.mock("mobx", () => {
  const mobx = jest.requireActual("mobx");
  return {
      ...mobx,
      observe: jest.fn((_, cb) => cb(({  type: 'add', name: '0', newValue: MOCK_COLLATERAL_AUCTION })))
  };
});

const MockApiRx = of({
  consts: {
    cdpEngine: {
      collateralCurrencyIds: [
        { Token: 'DOT' },
        { Token: 'LDOT' },
        { Token: 'RENBTC' }
      ].map(x => register.createType('CurrencyId', x))
    }
  }
});

jest.mock('@polkadot/api', () => ({
  WsProvider: jest.fn(() => {}),
  ApiPromise: { create: jest.fn() },
  ApiRx: { create: jest.fn(() => MockApiRx) },
}));
