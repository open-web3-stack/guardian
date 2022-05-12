import './__mocks__/mockApiRx';

import CollateralAuctionsTask from '../CollateralAuctionsTask';
import { AcalaGuardian } from '../../../guardians';

describe('CollateralAuctionsTask', () => {
  const guardian = new AcalaGuardian({
    chain: 'acala',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: []
  });

  const task = new CollateralAuctionsTask({
    account: 't6X8qpY26nsi6WDMkhbyaTz6cLtNBt7xfs4H9k94D3kM1Lm',
    currencyId: { Token: 'RENBTC' }
  });

  it('works with mock', async (done) => {
    const output$ = await task.start(guardian);

    output$.subscribe((result) => {
      expect(result).toStrictEqual({
        account: 't6X8qpY26nsi6WDMkhbyaTz6cLtNBt7xfs4H9k94D3kM1Lm',
        currencyId: 'RENBTC',
        auctionId: 0,
        initialAmount: '100',
        amount: '100',
        target: '20',
        startTime: 20,
        endTime: 125,
        lastBidder: 't6X8qpY26nsi6WDMkhbyaTz6cLtNBt7xfs4H9k94D3kM1Lm',
        lastBid: '30'
      });
      done();
    });
  });
});
