jest.mock('axios');
import axios from 'axios';
import ActionPOST from '../ActionPOST';

describe('ActionPOST', () => {
  // @ts-ignore
  axios.request = jest.fn();

  it('run action', () => {
    const action = new ActionPOST();

    const actionRun = jest.spyOn(action, 'run');

    action.run({ url: 'localhost' }, { foo: 'bar' });

    expect(actionRun).toBeCalledTimes(1);
  });
});
