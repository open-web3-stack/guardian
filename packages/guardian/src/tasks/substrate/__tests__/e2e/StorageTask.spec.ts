import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import StorageTask from '../../StorageTask';
import { SubstrateGuardianConfig } from '../../../../types';
import { SubstrateGuardian } from '../../../..';

describe('StorageTask', () => {
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

  it('works with single args', async () => {
    const task = new StorageTask({ name: 'system.account', args: 'FcxNWVy5RESDsErjwyZmPCW6Z8Y3fbfLzmou34YZTrbcraL' });
    const output$ = await task.start(guardian);

    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output.value.toString());
    expect(output.value).toBeTruthy();
  });

  it('works with multiple args', async () => {
    const task = new StorageTask({
      name: 'system.account',
      args: ['FcxNWVy5RESDsErjwyZmPCW6Z8Y3fbfLzmou34YZTrbcraL']
    });
    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output.value.toString());
    expect(output.value).toBeTruthy();
  });
});
