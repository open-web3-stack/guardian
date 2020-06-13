import { of, timer } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { TypeRegistry } from '@polkadot/types';
import { Option, UInt } from '@polkadot/types/codec';
import { types } from '@acala-network/types';

const register = new TypeRegistry();
register.register(types);

const createIndex = (index: number) => new UInt(register, index);

const AUCTION = new Option(register, 'AuctionInfo', {
  bid: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', 30],
  start: 1,
  end: 125,
});

const COLLATERAL_AUCTION = new Option(register, 'CollateralAuctionItem', {
  owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  currencyId: 'ACA',
  auctionId: 0,
  amount: 100,
  target: 20,
  startTime: 20,
});

const DEBIT_AUCTION = new Option(register, 'DebitAuctionItem', {
  amount: 100,
  fix: 20,
  startTime: 1,
});

const SURPLUS_AUCTION = new Option(register, 'SurplusAuctionItem', {
  amount: 100,
  startTime: 1,
});

const MockAuctions = {
  ApiRx: jest.fn().mockImplementation(() => {
    return {
      isReady: of({
        query: {
          auction: {
            auctionsIndex: jest.fn(() =>
              timer(0, 1000).pipe(
                take(2),
                map((i) => createIndex(i)) // |-0--1- meaning 1 actions created with ids 0 and next is 1
              )
            ),
            auctions: jest.fn(() => of(AUCTION)),
          },
          auctionManager: {
            collateralAuctions: jest.fn(() => of(COLLATERAL_AUCTION)),
            surplusAuctions: jest.fn(() => of(SURPLUS_AUCTION)),
            debitAuctions: jest.fn(() => of(DEBIT_AUCTION)),
          },
        },
      }),
    };
  }),
};

export default () => {
  jest.mock('@polkadot/api', () => MockAuctions);
};
