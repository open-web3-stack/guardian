import './__mocks__/mockAuctions';

import DebitAuctionsTask from '../DebitAuctionsTask';
import { AcalaGuardian } from '../../../guardians';

describe('DebitAuctionsTask', () => {
  const guardian = new AcalaGuardian('acala-guardian', {
    networkType: 'acalaChain',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: {},
  });

  const task = new DebitAuctionsTask();

  it('works with mock', async (done) => {
    const output$ = await task.start(guardian);
    output$.subscribe((result) => {
      expect(result).toStrictEqual({
        auctionId: 0,
        initialAmount: '100',
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
