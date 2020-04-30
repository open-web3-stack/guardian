import { Observable } from 'rxjs';
import PositionsByTraderTask from '../PositionsByTraderTask';

describe('PositionsByTraderTask', () => {
  const task = new PositionsByTraderTask();

  it('works with valid arguments', () => {
    expect(task.call({ account: 'alice' })).toBeInstanceOf(Observable);
    expect(task.call({ account: ['alice'] })).toBeInstanceOf(Observable);
  });

  it("doesn't work with valid arguments", () => {
    // @ts-ignore
    expect(() => task.call()).toThrow(Error);
    // expect(() => task.call({})).toThrow(Error);
  });
});
