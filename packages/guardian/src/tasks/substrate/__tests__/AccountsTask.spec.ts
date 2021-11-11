import AccountsTask from '../AccountsTask';

describe('AccountsTask', () => {
  it('works with valid arguments', () => {
    expect(new AccountsTask({ account: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG' }).arguments).toStrictEqual({
      account: '5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG'
    });
    expect(new AccountsTask({ account: ['5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG'] }).arguments).toStrictEqual(
      {
        account: ['5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG']
      }
    );
  });
});
