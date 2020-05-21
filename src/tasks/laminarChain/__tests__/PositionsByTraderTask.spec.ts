import { never } from 'rxjs';
import PositionsByTraderTask from '../PositionsByTraderTask';

describe('PositionsByTraderTask', () => {
  const task = new PositionsByTraderTask(never());

  it('works with valid arguments', () => {
    expect(task.validateCallArguments({ account: 'alice' })).toStrictEqual({ account: 'alice' });
    expect(task.validateCallArguments({ account: ['alice'] })).toStrictEqual({ account: ['alice'] });
  });

  it("doesn't work with invalid arguments", () => {
    expect(() => task.validateCallArguments()).toThrow(Error);
    expect(() => task.validateCallArguments({})).toThrow(Error);
    expect(() => task.validateCallArguments({ account: null })).toThrow(Error);
    expect(() => task.validateCallArguments({ account: [] })).toThrow(Error);
  });
});
