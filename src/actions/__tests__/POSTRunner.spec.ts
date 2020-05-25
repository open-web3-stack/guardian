jest.mock('axios');
import axios from 'axios';
import POSTRunner from '../POSTRunner';

describe('POSTRunner', () => {
  // @ts-ignore
  axios.request = jest.fn();

  it('run action', () => {
    const action = new POSTRunner();

    const actionRun = jest.spyOn(action, 'run');

    action.run({ url: 'localhost' }, { foo: 'bar' });

    expect(actionRun).toBeCalledTimes(1);
  });
});
