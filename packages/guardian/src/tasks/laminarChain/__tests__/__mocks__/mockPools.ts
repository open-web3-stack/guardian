import { of } from 'rxjs';
import { TypeRegistry } from '@polkadot/types';
import { types } from '@laminar/types';
import { observable } from 'mobx';
import { customTypes } from '../../../../customTypes';

const register = new TypeRegistry();
register.register(types);
register.register(customTypes);

const POOL = register.createType('Option<Pool>', {
  owner: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
  balance: 1000,
});
const CURRENCY_OPTION = register.createType('SyntheticPoolCurrencyOption');
const PAIR_OPTION = register.createType('MarginPoolTradingPairOption');
const PAIR = register.createType('TradingPair', { base: 'FEUR', quote: 'AUSD' });

const MockStorage = {
  baseLiquidityPoolsForMargin: {
    pools: jest.fn(() => POOL),
  },
  marginLiquidityPools: {
    poolTradingPairOptions: {
      entries: jest.fn(() => observable.map({ [PAIR.toString()]: PAIR_OPTION }, { deep: false })),
    },
    tradingPairOptions: jest.fn(() => register.createType('MarginTradingPairOption', { maxSpread: 10 })),
    poolOptions: jest.fn(() => register.createType('MarginPoolOption')),
    defaultMinLeveragedAmount: register.createType('Balance'),
  },
  baseLiquidityPoolsForSynthetic: {
    pools: jest.fn(() => POOL),
  },
  syntheticLiquidityPools: {
    poolCurrencyOptions: {
      entries: jest.fn(() => observable.map({ FEUR: CURRENCY_OPTION }, { deep: false })),
    },
  },
  syntheticTokens: {
    positions: jest.fn(() => register.createType('SyntheticPosition', { collateral: 100, synthetic: 10 })),
    ratios: jest.fn(() => register.createType('SyntheticTokensRatio')),
  },
  laminarOracle: {
    rawValues: {
      allEntries: jest.fn(() =>
        observable.map({
          0: observable.map({
            FEUR: register.createType('Option<TimestampedValue>', { value: '1200000000000000000' }),
          }),
        })
      ),
    },
  },
};

const MockApiRx = {
  isReady: of({}),
  createType: (type: any, value: any) => register.createType(type, value),
};

jest.mock('@open-web3/api-mobx', () => ({
  createStorage: jest.fn(() => MockStorage),
}));

jest.mock('@polkadot/rpc-provider', () => ({
  WsProvider: jest.fn(() => ({ isConnected: jest.fn(() => true) })),
}));

jest.mock('@polkadot/api', () => ({
  ApiPromise: { create: jest.fn() },
  ApiRx: jest.fn(() => MockApiRx),
}));
