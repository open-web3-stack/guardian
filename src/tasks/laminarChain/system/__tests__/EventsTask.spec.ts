import { Observable } from 'rxjs';
import EventsTask from '../EventsTask';

describe('EventsTask', () => {
  const task = new EventsTask();

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
