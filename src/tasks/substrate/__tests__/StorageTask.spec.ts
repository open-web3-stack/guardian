import { never } from 'rxjs';

import StorageTask from '../StorageTask';

describe('StorageTask', () => {
  const task = new StorageTask(never());

  it('works with valid arguments', () => {
    expect(task.validateCallArguments({ name: 'system.events' })).toStrictEqual({ name: 'system.events' });
    expect(
      task.validateCallArguments({
        name: ['sytems.events', 'system.account'],
      })
    ).toStrictEqual({
      name: ['sytems.events', 'system.account'],
    });
  });

  it("doesn't work with invalid arguments", () => {
    expect(() => task.validateCallArguments({ name: [], args: true })).toThrow(Error);
    expect(() => task.validateCallArguments()).toThrow(Error);
  });
});
