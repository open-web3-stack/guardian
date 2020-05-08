import { map } from 'rxjs/operators';
import StorageTask from '../../StorageTask';
import createLaminarApi from '../../../laminarChain/createLaminarApi';

describe('StorageTask', () => {
  const api$ = createLaminarApi('ws://localhost:9944').pipe(map((api) => api.api));
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
