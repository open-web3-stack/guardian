import { nodeEndpoint, address } from './const';

export default {
  version: '0.1',
  guardians: {
    'acala-guardian': {
      networkType: 'acalaChain',
      network: 'karura',
      nodeEndpoint,
      confirmation: 'finalize',
      monitors: {
        AuctionDealed: {
          task: 'system.events',
          arguments: {
            name: 'auctionManager.CollateralAuctionDealed',
          },
          actions: [{ method: 'events' }],
        },
        CollateralAuction: {
          task: 'honzon.collateralAuctions',
          arguments: {
            account: 'all',
            currencyId: 'XBTC',
          },
          actions: [{ method: 'collateralAuctions' }],
        },
        AUSDBalance: {
          task: 'account.balances',
          arguments: {
            account: address,
            currencyId: 'AUSD',
          },
          actions: [{ method: 'balance' }],
        },
        AUSDPrice: {
          task: 'oracle.prices',
          arguments: {
            key: 'XBTC',
          },
          actions: [{ method: 'price' }],
        },
      },
    },
  },
};
