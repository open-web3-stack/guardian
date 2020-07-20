import TraderInfoTask from '../TraderInfoTask';

describe('TraderInfoTask', () => {
  it('works with valid arguments', () => {
    expect(new TraderInfoTask({ account: 'alice', poolId: 'all' }).arguments).toStrictEqual({
      account: 'alice',
      poolId: 'all',
    });
    expect(new TraderInfoTask({ account: ['alice'], poolId: [1] }).arguments).toStrictEqual({
      account: ['alice'],
      poolId: [1],
    });
  });
});
