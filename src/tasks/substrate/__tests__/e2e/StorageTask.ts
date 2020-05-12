import { ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import StorageTask from '../../StorageTask';

describe('StorageTask', () => {
  const api$ = ApiRx.create({ provider: new WsProvider('ws://localhost:9944') });
  const task = new StorageTask(api$);

  jest.setTimeout(30_000);

  it('works with single args', (done) => {
    task
      .call({ name: 'system.account', args: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG' })
      .subscribe((output) => {
        console.log(output.value.toString());
        expect(output.value).toBeTruthy();
        done();
      });
  });

  it('works with multiple args', (done) => {
    task
      .call({ name: 'system.account', args: ['5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG'] })
      .subscribe((output) => {
        console.log(output.value.toString());
        expect(output.value).toBeTruthy();
        done();
      });
  });
});
