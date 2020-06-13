import { never } from 'rxjs';
import BalancesTask from '../BalancesTask';

describe('BalancesTask', () => {
  const task = new BalancesTask(never());

  it('works with valid arguments', () => {
    expect(task.validateCallArguments({ account: 'alice', currencyId: 'FEUR' })).toStrictEqual({
      account: 'alice',
      currencyId: 'FEUR',
    });
    expect(task.validateCallArguments({ account: ['alice'], currencyId: ['FEUR'] })).toStrictEqual({
      account: ['alice'],
      currencyId: ['FEUR'],
    });
  });

  it("doesn't work with invalid arguments", () => {
    expect(() => task.validateCallArguments({ account: '' })).toThrow(Error);
    expect(() => task.validateCallArguments()).toThrow(Error);
  });
});
