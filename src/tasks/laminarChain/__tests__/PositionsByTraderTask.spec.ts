import { Observable } from 'rxjs';
import PositionsByTraderTask from '../PositionsByTraderTask';
import createLaminarApi from '../createLaminarApi';

describe('PositionsByTraderTask', () => {
  const api$ = createLaminarApi('ws://localhost:9944');
  const task = new PositionsByTraderTask(api$);

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
