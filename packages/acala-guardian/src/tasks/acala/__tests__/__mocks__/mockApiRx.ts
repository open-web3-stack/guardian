import { of, merge, timer } from 'rxjs';
import { concatAll, mapTo, share } from 'rxjs/operators';
import { acalaRpc } from '../../../../__tests__/__mocks__/mockApiPromise';
import { registry, storageKeyMaker } from '../../../../utils/acala/testHelpers';
const collateralAuctionsKey = storageKeyMaker('AuctionManager', 'CollateralAuctions');

const AUSD = registry.createType('CurrencyId', { Token: 'AUSD' });
const ACA = registry.createType('CurrencyId', { Token: 'ACA' });
const RENBTC = registry.createType('CurrencyId', { Token: 'RENBTC' });
const ASSET_DOT = registry.createType('AcalaPrimitivesCurrencyAssetIds', { NativeAssetId: { Token: 'DOT' } });
const ASSET_RENBTC = registry.createType('AcalaPrimitivesCurrencyAssetIds', { NativeAssetId: { Token: 'RENBTC' } });

const AUSD_META = registry.createType('Option<AcalaAssetMetadata>', {
  name: 'Acala USD',
  symbol: 'AUSD',
  decimals: 12
});
const DOT_META = registry.createType('Option<AcalaAssetMetadata>', { name: 'Polkadot', symbol: 'DOT', decimals: 10 });
const RENBTC_META = registry.createType('Option<AcalaAssetMetadata>', {
  name: 'Bitcoin',
  symbol: 'RENBTC',
  decimals: 8
});

const COLLATERAL_CURRENCY_IDS = registry.createType('Vec<CurrencyId>', [
  { token: 'DOT' },
  { token: 'LDOT' },
  { Token: 'RENBTC' }
]);
const POSITION = registry.createType('Position', { debit: '2500000000000000', collateral: '10000000000' });
const EXCHANGE_RATE = registry.createType('Option<ExchangeRate>', '100000000000000000');
const PRICE = registry.createType('Option<TimestampedValueOf>', { value: '300000000000000000000' });
const PRICE_UPDATED = registry.createType('Option<TimestampedValueOf>', { value: '280000000000000000000' });
const LP = registry.createType('(Balance, Balance)', ['100000000000000000000', '400000000000000000000']);

const AUCTION = registry.createType('Option<AuctionInfo>', {
  bid: ['t6X8qpY26nsi6WDMkhbyaTz6cLtNBt7xfs4H9k94D3kM1Lm', 30],
  start: 1,
  end: 125
});

const COLLATERAL_AUCTION = registry.createType('Option<CollateralAuctionItem>', {
  refundRecipient: 't6X8qpY26nsi6WDMkhbyaTz6cLtNBt7xfs4H9k94D3kM1Lm',
  currencyId: { token: 'RENBTC' },
  initialAmount: 100,
  amount: 100,
  target: 20,
  startTime: 20
});

const MockApiRx = of({
  ...acalaRpc,
  consts: {
    prices: { stableCurrencyFixedPrice: 1e18 },
    currencies: { getNativeCurrencyId: ACA },
    cdpEngine: {
      getStableCurrencyId: AUSD,
      collateralCurrencyIds: COLLATERAL_CURRENCY_IDS
    }
  },
  query: {
    assetRegistry: {
      assetMetadatas: (assetId) => {
        if (registry.createType('AcalaPrimitivesCurrencyAssetIds', assetId).eq(ASSET_DOT)) {
          return of(DOT_META);
        }
        if (registry.createType('AcalaPrimitivesCurrencyAssetIds', assetId).eq(ASSET_RENBTC)) {
          return of(RENBTC_META);
        }
        return of(AUSD_META);
      }
    },
    auctionManager: {
      collateralAuctions: {
        entries: () => of([[collateralAuctionsKey(0), COLLATERAL_AUCTION]])
      }
    },
    auction: {
      auctionsIndex: () => of(registry.createType('AuctionId', 1)),
      auctions: () => of(AUCTION)
    },
    dex: {
      liquidityPool: () => of(LP)
    },
    loans: {
      positions: () => of(POSITION)
    },
    cdpEngine: {
      collateralParams: { keys: () => of([{ args: [RENBTC] }]) },
      debitExchangeRate: () => of(EXCHANGE_RATE)
    },
    acalaOracle: {
      values: () => {
        return merge([of(PRICE), timer(1000).pipe(mapTo(PRICE_UPDATED))]).pipe(concatAll(), share());
      }
    }
  },
  createType: (type: string, value: any) => registry.createType(type, value)
});

jest.mock('@polkadot/api', () => ({
  WsProvider: jest.fn(() => {}),
  ApiRx: { create: jest.fn(() => MockApiRx) }
}));
