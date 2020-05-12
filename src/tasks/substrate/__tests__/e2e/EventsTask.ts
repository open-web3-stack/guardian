import { ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import EventsTask from '../../EventsTask';

describe('EventsTask', () => {
  const api$ = ApiRx.create({ provider: new WsProvider('ws://localhost:9944') });
  const task = new EventsTask(api$);

  jest.setTimeout(30_000);

  it('works with single name', (done) => {
    task.call({ name: 'system.ExtrinsicSuccess' }).subscribe((output) => {
      console.log(output.args.toString());
      expect(output.args).toBeTruthy();
      done();
    });
  });

  it('works with multiple names', (done) => {
    task.call({ name: ['system.ExtrinsicSuccess'] }).subscribe((output) => {
      console.log(output.args.toString());
      expect(output.args).toBeTruthy();
      done();
    });
  });
});
