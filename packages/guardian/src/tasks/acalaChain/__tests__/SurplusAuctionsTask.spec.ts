import './__mocks__/mockAuctions';

import SurplusAuctionsTask from '../SurplusAuctionsTask';
import { AcalaGuardian } from '../../../guardians';

describe('SurplusAuctionsTask', () => {
  const guardian = new AcalaGuardian('acala-guardian', {
    networkType: 'acalaChain',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: {},
  });

  const task = new SurplusAuctionsTask();

  it('works with mock', async (done) => {
    const output$ = await task.start(guardian);
    output$.subscribe((result) => {
      expect(result).toStrictEqual({
        auctionId: 0,
        amount: '100',
        startTime: 1,
        endTime: 125,
        lastBid: '30',
        lastBidder: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      });
      done();
    });
  });
});
