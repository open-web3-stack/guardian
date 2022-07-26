import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { AccountsTask, EventsTask, StorageTask } from '../..';
import { SubstrateGuardian } from '../../../..';
import { SubstrateGuardianConfig } from '../../../../types';

describe('Substrate tasks', () => {
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

  it('EventsTask works with single name', async () => {
    const task = new EventsTask({ name: 'system.ExtrinsicSuccess' });
    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output);
    expect(output.args['dispatch_info']).toBeTruthy();
  });

  it('EventsTask works with multiple names', async () => {
    const task = new EventsTask({ name: ['system.ExtrinsicSuccess'] });
    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output);
    expect(output.args['dispatch_info']).toBeTruthy();
  });

  it('StorageTask works with single args', async () => {
    const task = new StorageTask({ name: 'system.account', args: 'FcxNWVy5RESDsErjwyZmPCW6Z8Y3fbfLzmou34YZTrbcraL' });
    const output$ = await task.start(guardian);

    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output.value.toString());
    expect(output.value).toBeTruthy();
  });

  it('StorageTask works with multiple args', async () => {
    const task = new StorageTask({
      name: 'system.account',
      args: ['FcxNWVy5RESDsErjwyZmPCW6Z8Y3fbfLzmou34YZTrbcraL']
    });
    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output.value.toString());
    expect(output.value).toBeTruthy();
  });

  it('AccountsTask works', async () => {
    const task = new AccountsTask({ account: 'FcxNWVy5RESDsErjwyZmPCW6Z8Y3fbfLzmou34YZTrbcraL' });
    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output);
    expect(output).toBeTruthy();
  });
});
