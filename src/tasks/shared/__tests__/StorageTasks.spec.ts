import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import StorageTask from '../StorageTask';
import createLaminarApi from '../../laminarChain/createLaminarApi';

describe('StorageTask', () => {
  const api$ = createLaminarApi('ws://localhost:9944').pipe(map((api) => api.api));
  const task = new StorageTask(api$);

  jest.setTimeout(30_000);

  it('works with valid arguments', () => {
    expect(task.call({ name: 'system.events' })).toBeInstanceOf(Observable);
    expect(
      task.call({
        name: ['sytems.events', 'system.account'],
      })
    ).toBeInstanceOf(Observable);
  });

  it("doesn't work with invalid arguments", () => {
    // @ts-ignore
    expect(() => task.call({ name: '' })).toThrow(Error);
    // @ts-ignore
    expect(() => task.call()).toThrow(Error);
  });
});
