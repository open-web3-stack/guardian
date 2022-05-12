import EventsTask from '../../EventsTask';
import { SubstrateGuardian } from '../../../../guardians';
import { SubstrateGuardianConfig } from '../../../../types';

describe('EventsTask', () => {
  jest.setTimeout(60_000);

  const config: SubstrateGuardianConfig = {
    chain: 'substrate',
    nodeEndpoint: 'wss://kusama-rpc.polkadot.io/',
    monitors: []
  };

  const guardian = new SubstrateGuardian(config);

  it('works with single name', async (done) => {
    const task = new EventsTask({ name: 'system.ExtrinsicSuccess' });
    const output$ = await task.start(guardian);
    output$.subscribe((output) => {
      console.log(output);
      expect(output.args['dispatch_info']).toBeTruthy();
      done();
    });
  });

  it('works with multiple names', async (done) => {
    const task = new EventsTask({ name: ['system.ExtrinsicSuccess'] });
    const output$ = await task.start(guardian);
    output$.subscribe((output) => {
      console.log(output);
      expect(output.args['dispatch_info']).toBeTruthy();
      done();
    });
  });
});
