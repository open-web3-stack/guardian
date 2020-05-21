import mockAuctions from './__mocks__/mockAuctions';
mockAuctions();

import SurplusAuctionsTask from '../SurplusAuctionsTask';
import { createAcalaApi } from '../../acalaChain';

describe('SurplusAuctionsTask', () => {
  const api$ = createAcalaApi(['ws://localhost:9944']);

  it('works with mock', (done) => {
    new SurplusAuctionsTask(api$).run(null).subscribe((result) => {
      expect(result).toStrictEqual({ auctionId: 0, amount: '100', startTime: 1, endTime: 125 });
      done();
    });
  });
});
