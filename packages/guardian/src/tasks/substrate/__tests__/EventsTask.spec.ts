import EventsTask from '../EventsTask';

describe('EventsTask', () => {
  it('works with valid arguments', () => {
    expect(new EventsTask({ name: 'margin.TraderMarginCalled' }).arguments).toStrictEqual({
      name: 'margin.TraderMarginCalled',
    });
    expect(new EventsTask({ name: ['margin.TraderMarginCalled', 'margin.PoolMarginCalled'] }).arguments).toStrictEqual({
      name: ['margin.TraderMarginCalled', 'margin.PoolMarginCalled'],
    });
  });
});
