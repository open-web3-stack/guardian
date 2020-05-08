import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import AccountsTask from '../AccountsTask';
import createLaminarApi from '../../laminarChain/createLaminarApi';

describe('AccountsTask', () => {
  const api$ = createLaminarApi('ws://localhost:9944').pipe(map((api) => api.api));
  const task = new AccountsTask(api$);

  jest.setTimeout(30_000);

  it('works with valid arguments', () => {
    expect(task.call({ account: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG' })).toBeInstanceOf(Observable);
    expect(
      task.call({
        account: ['5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG'],
      })
    ).toBeInstanceOf(Observable);
  });

  it("doesn't work with invalid arguments", () => {
    // @ts-ignore
    expect(() => task.call({ account: '' })).toThrow(Error);
    // @ts-ignore
    expect(() => task.call()).toThrow(Error);
  });
});
