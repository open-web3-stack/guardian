import './__mocks__/mockAuctions';

import DebitAuctionsTask from '../DebitAuctionsTask';
import { createAcalaApi } from '../../acalaChain';

describe('DebitAuctionsTask', () => {
  const api$ = createAcalaApi(['ws://localhost:9944']);

  it('works with mock', (done) => {
    new DebitAuctionsTask(api$).run(null).subscribe((result) => {
      expect(result).toStrictEqual({
        auctionId: 0,
        amount: '100',
        fix: '20',
        startTime: 1,
        endTime: 125,
        lastBid: '30',
        lastBidder: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      });
      done();
    });
  });
});
