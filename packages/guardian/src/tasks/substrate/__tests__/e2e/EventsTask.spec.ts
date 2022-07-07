import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import EventsTask from '../../EventsTask';
import { SubstrateGuardian } from '../../../..';
import { SubstrateGuardianConfig } from '../../../../types';

describe('EventsTask', () => {
  jest.setTimeout(60_000);

  const config: SubstrateGuardianConfig = {
    chain: 'substrate',
    nodeEndpoint: 'wss://kusama-rpc.polkadot.io/',
    monitors: []
  };

  const guardian = new SubstrateGuardian(config);

  afterAll(async () => {
    await guardian.teardown();
  });

  it('works with single name', async () => {
    const task = new EventsTask({ name: 'system.ExtrinsicSuccess' });
    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output);
    expect(output.args['dispatch_info']).toBeTruthy();
  });

  it('works with multiple names', async () => {
    const task = new EventsTask({ name: ['system.ExtrinsicSuccess'] });
    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output);
    expect(output.args['dispatch_info']).toBeTruthy();
  });
});
