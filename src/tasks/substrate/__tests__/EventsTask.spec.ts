import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import EventsTask from '../EventsTask';
import createLaminarApi from '../../laminarChain/createLaminarApi';

describe('EventsTask', () => {
  const api$ = createLaminarApi('ws://localhost:9944').pipe(map((api) => api.api));
  const task = new EventsTask(api$);

  it('works with valid arguments', () => {
    expect(task.call({ name: 'margin.TraderMarginCalled' })).toBeInstanceOf(Observable);
    expect(
      task.call({
        name: ['margin.TraderMarginCalled', 'margin.PoolMarginCalled'],
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
