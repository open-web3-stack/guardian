import { never } from 'rxjs';
import AccountsTask from '../AccountsTask';

describe('AccountsTask', () => {
  const task = new AccountsTask(never());

  it('works with valid arguments', () => {
    expect(task.validateCallArguments({ account: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG' })).toStrictEqual({
      account: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG',
    });
    expect(
      task.validateCallArguments({
        account: ['5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG'],
      })
    ).toStrictEqual({
      account: ['5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG'],
    });
  });

  it("doesn't work with invalid arguments", () => {
    expect(() => task.validateCallArguments({ account: '' })).toThrow(Error);
    expect(() => task.validateCallArguments()).toThrow(Error);
  });
});
