import mockAuctions from './__mocks__/mockAuctions';
mockAuctions();

import CollateralAuctionsTask from '../CollateralAuctionsTask';
import createAcalaApi from '../createAcalaApi';

describe('CollateralAuctionsTask', () => {
  const api$ = createAcalaApi(['ws://localhost:9944']);

  it('works with mock', (done) => {
    new CollateralAuctionsTask(api$)
      .run({
        account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        currencyId: 'ACA',
      })
      .subscribe((result) => {
        expect(result).toStrictEqual({
          account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          currencyId: 'ACA',
          auctionId: 0,
          amount: '100',
          target: '20',
          startTime: 20,
          endTime: 125,
          lastBidder: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          lastBid: '30',
        });
        done();
      });
  });

  it('fulfillArguments works', () => {
    expect(CollateralAuctionsTask.fulfillArguments(['a'])('a')).toBe(true);
    expect(CollateralAuctionsTask.fulfillArguments('a')('a')).toBe(true);
    expect(CollateralAuctionsTask.fulfillArguments('all')('a')).toBe(true);
    expect(CollateralAuctionsTask.fulfillArguments('a')('b')).toBe(false);
    expect(CollateralAuctionsTask.fulfillArguments(['a'])('b')).toBe(false);
  });
});
