import './__mocks__/mockAuctions';

import { getAuctionsIds } from '../helpers';
import { AcalaGuardian } from '../../../guardians';

describe('helpers', () => {
  const guardian = new AcalaGuardian('acala-guardian', {
    network: 'dev',
    networkType: 'acalaChain',
    nodeEndpoint: 'ws://localhost:9944',
    monitors: {},
  });

  it('getAuctionsIds works', async (done) => {
    const { apiRx } = await guardian.isReady();
    const ids$ = getAuctionsIds(apiRx);
    ids$.subscribe((id) => {
      expect(id).toBe(0);
      done();
    });
  });
});
