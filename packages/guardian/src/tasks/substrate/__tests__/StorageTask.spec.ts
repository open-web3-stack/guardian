import StorageTask from '../StorageTask';

describe('StorageTask', () => {
  it('works with valid arguments', () => {
    expect(new StorageTask({ name: 'system.events' }).arguments).toStrictEqual({ name: 'system.events' });
    expect(new StorageTask({ name: ['sytems.events', 'system.account'] }).arguments).toStrictEqual({
      name: ['sytems.events', 'system.account'],
    });
  });
});
