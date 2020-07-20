import PositionsByTraderTask from '../PositionsByTraderTask';

it('works with valid arguments', () => {
  expect(new PositionsByTraderTask({ account: 'alice' }).arguments).toStrictEqual({ account: 'alice' });
  expect(new PositionsByTraderTask({ account: ['alice'] }).arguments).toStrictEqual({ account: ['alice'] });
});
