import './__mocks__/mockAuctions';

import CollateralAuctionsTask from '../CollateralAuctionsTask';
import { AcalaGuardian } from '../../../guardians';

describe.skip('CollateralAuctionsTask', () => {
  const guardian = new AcalaGuardian('acala-guardian', {
    networkType: 'acalaChain',
    network: 'dev',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: {},
  });

  const task = new CollateralAuctionsTask({
    account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    currencyId: 'ACA',
  });

  it('works with mock', async (done) => {
    const output$ = await task.start(guardian);

    output$.subscribe((result) => {
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
