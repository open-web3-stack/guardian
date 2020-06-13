import './__mocks__/mockAuctions';

import { getAuctionsIds } from '../helpers';
import createAcalaApi from '../createAcalaApi';

describe('helpers', () => {
  const api$ = createAcalaApi(['ws://localhost:9944']);
  it('getAuctionsIds works', async (done) => {
    const api = await api$.toPromise();
    const ids$ = getAuctionsIds(api);
    ids$.subscribe((id) => {
      expect(id).toBe(0);
      done();
    });
  });
});
