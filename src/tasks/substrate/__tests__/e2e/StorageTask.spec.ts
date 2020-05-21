import { ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import StorageTask from '../../StorageTask';

describe('StorageTask', () => {
  const api$ = ApiRx.create({ provider: new WsProvider('wss://kusama-rpc.polkadot.io/') });
  const task = new StorageTask(api$);

  jest.setTimeout(60_000);

  it('works with single args', (done) => {
    task
      .run({ name: 'system.account', args: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG' })
      .subscribe((output) => {
        console.log(output.value.toString());
        expect(output.value).toBeTruthy();
        done();
      });
  });

  it('works with multiple args', (done) => {
    task
      .run({ name: 'system.account', args: ['5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG'] })
      .subscribe((output) => {
        console.log(output.value.toString());
        expect(output.value).toBeTruthy();
        done();
      });
  });
});
