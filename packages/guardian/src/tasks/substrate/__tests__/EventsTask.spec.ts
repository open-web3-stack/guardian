import { never } from 'rxjs';
import EventsTask from '../EventsTask';

describe('EventsTask', () => {
  const task = new EventsTask(never());

  it('works with valid arguments', () => {
    expect(task.validateCallArguments({ name: 'margin.TraderMarginCalled' })).toStrictEqual({
      name: 'margin.TraderMarginCalled',
    });
    expect(
      task.validateCallArguments({
        name: ['margin.TraderMarginCalled', 'margin.PoolMarginCalled'],
      })
    ).toStrictEqual({
      name: ['margin.TraderMarginCalled', 'margin.PoolMarginCalled'],
    });
  });

  it("doesn't work with invalid arguments", () => {
    expect(() => task.validateCallArguments({ name: '' })).toThrow(Error);
    expect(() => task.validateCallArguments()).toThrow(Error);
  });
});
