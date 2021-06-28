import StorageTask from '../../StorageTask';
import { SubstrateGuardianConfig } from '../../../../types';
import { SubstrateGuardian } from '../../../../guardians';

describe('StorageTask', () => {
  jest.setTimeout(60_000);

  const config: SubstrateGuardianConfig = {
    networkType: 'substrateChain',
    nodeEndpoint: 'wss://kusama-rpc.polkadot.io/',
    monitors: {},
  };

  const guardian = new SubstrateGuardian('substrate-guardian', config);

  it('works with single args', async (done) => {
    const task = new StorageTask({ name: 'system.account', args: 'FcxNWVy5RESDsErjwyZmPCW6Z8Y3fbfLzmou34YZTrbcraL' });
    const output$ = await task.start(guardian);
    output$.subscribe((output) => {
      console.log(output.value.toString());
      expect(output.value).toBeTruthy();
      done();
    });
  });

  it('works with multiple args', async (done) => {
    const task = new StorageTask({
      name: 'system.account',
      args: ['FcxNWVy5RESDsErjwyZmPCW6Z8Y3fbfLzmou34YZTrbcraL'],
    });
    const output$ = await task.start(guardian);
    output$.subscribe((output) => {
      console.log(output.value.toString());
      expect(output.value).toBeTruthy();
      done();
    });
  });
});
