import { of, NEVER } from 'rxjs';
import { registry, storageKeyMaker } from '../../../../utils/laminar/testHelpers';
import { laminarRpc } from '../../../../__tests__/__mocks__/mockApiPromise';

const poolsKey = storageKeyMaker('BaseLiquidityPoolsForMargin', 'Pools');
const poolTradingPairOptionsKey = storageKeyMaker('MarginLiquidityPools', 'PoolTradingPairOptions');

const POOL = registry.createType('Option<Pool>', {
  owner: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
  balance: 1000
});
const CURRENCY_OPTION = registry.createType('SyntheticPoolCurrencyOption', {
  bidSpread: 10,
  askSpread: 20,
  additionalCollateralRatio: 50,
  syntheticEnabled: true
});
const PAIR_OPTION = registry.createType('MarginPoolTradingPairOption', {
  enabled: true,
  enabledTrades: ['LongTwo', 'ShortTwo']
});
const PAIR = registry.createType('TradingPair', { base: 'FEUR', quote: 'AUSD' });

const MockApiRx = of({
  ...laminarRpc,
  query: {
    baseLiquidityPoolsForMargin: {
      pools: {
        entries: () => of([[poolsKey(0), POOL]])
      }
    },
    marginLiquidityPools: {
      poolTradingPairOptions: {
        entries: () => of([[poolTradingPairOptionsKey(0, PAIR), PAIR_OPTION]])
      },
      tradingPairOptions: () => of(registry.createType('MarginTradingPairOption', { maxSpread: 10 })),
      poolOptions: () => of(registry.createType('MarginPoolOption')),
      defaultMinLeveragedAmount: () => of(registry.createType('Balance'))
    },
    baseLiquidityPoolsForSynthetic: {
      pools: () => of(POOL),
      nextPoolId: () => of(1)
    },
    syntheticLiquidityPools: {
      poolCurrencyOptions: () => of(CURRENCY_OPTION)
    },
    syntheticTokens: {
      positions: () =>
        of(
          registry.createType('SyntheticPosition', {
            collateral: '2054470869988219348',
            synthetic: '1653740113770234636'
          })
        ),
      ratios: () => of(registry.createType('SyntheticTokensRatio'))
    },
    laminarOracle: {
      values: (token) => {
        if (token.toString() === 'FEUR') {
          return of(registry.createType('Option<TimestampedValueOf>', { value: '1200000000000000000' }));
        }
        if (token.toString() === 'LAMI') {
          return of(registry.createType('Option<TimestampedValueOf>', { value: '2000000000000000000' }));
        }
        return NEVER;
      }
    }
  },
  createType: (type: string, value: any) => registry.createType(type, value)
});

jest.mock('@polkadot/api', () => ({
  WsProvider: jest.fn(() => {}),
  ApiRx: { create: jest.fn(() => MockApiRx) }
}));
