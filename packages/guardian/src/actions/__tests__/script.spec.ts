jest.mock('shelljs');
import shell from 'shelljs';
import script from '../script';

describe('script', () => {
  // @ts-ignore
  shell.exec = jest.fn(() => ({
    stdin: {
      write: jest.fn(),
      end: jest.fn(),
    },
  }));

  it('runs', () => {
    const execSpy = jest.spyOn(shell, 'exec');
    expect(execSpy).not.toBeCalled();
    script(null, { action: { method: 'script', path: 'foo' }});
    expect(execSpy).toBeCalledTimes(1);
  });
});
