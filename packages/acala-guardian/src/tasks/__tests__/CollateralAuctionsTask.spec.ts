import './__mocks__/mockApiRx';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

import CollateralAuctionsTask from '../CollateralAuctionsTask';
import AcalaGuardian from '../../AcalaGuardian';

describe('CollateralAuctionsTask', () => {
  const guardian = new AcalaGuardian({
    chain: 'acala',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: []
  });

  afterAll(async () => {
    await guardian.teardown();
  });

  const task = new CollateralAuctionsTask({
    account: 't6X8qpY26nsi6WDMkhbyaTz6cLtNBt7xfs4H9k94D3kM1Lm',
    currencyId: { Token: 'RENBTC' }
  });

  it('works with mock', async () => {
    const output$ = await task.start(guardian);
    const result = await firstValueFrom(output$.pipe(take(1)));
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
  });
});
