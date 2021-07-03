import './__mocks__/mockAuctions';

import CollateralAuctionsTask from '../CollateralAuctionsTask';
import { AcalaGuardian } from '../../../guardians';

describe('CollateralAuctionsTask', () => {
  const guardian = new AcalaGuardian('acala-guardian', {
    networkType: 'acalaChain',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: {},
  });

  const task = new CollateralAuctionsTask({
    account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    currencyId: 'RENBTC',
  });

  it('works with mock', async (done) => {
    const output$ = await task.start(guardian);

    output$.subscribe((result) => {
      expect(result).toStrictEqual({
        account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        currencyId: 'RENBTC',
        auctionId: 0,
        initialAmount: '100',
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
});
