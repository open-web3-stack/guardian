jest.mock('shelljs');

import shell from 'shelljs';
import ActionScript from '../ActionScript';

describe('ActionScript', () => {
  // @ts-ignore
  shell.exec = jest.fn(() => ({
    stdin: {
      write: jest.fn(),
      end: jest.fn(),
    },
  }));

  it('run action', () => {
    const action = new ActionScript();

    const actionRun = jest.spyOn(action, 'run');

    action.run({ path: 'foo' }, null);

    expect(actionRun).toBeCalledTimes(1);
  });
});
