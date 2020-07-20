jest.mock('axios');
import axios from 'axios';

import { ActionRegistry } from '../ActionRegistry';
import POST from '../POST';
import script from '../script';

describe('ActionRegistry', () => {
  axios.request = jest.fn();

  it('should have pre-register actions', () => {
    expect(ActionRegistry.getOrThrow('POST')).toBe(POST);
    expect(ActionRegistry.getOrThrow('script')).toBe(script);
    expect(() => ActionRegistry.getOrThrow('foo')).toThrow('Action foo not found!');
  });

  it('should register new action', () => {
    const foo = () => {};
    expect(ActionRegistry.register('foo', foo));
    expect(ActionRegistry.getOrThrow('foo')).toBe(foo);
  });

  it('should run action', () => {
    const requestSpy = jest.spyOn(axios, 'request');
    expect(requestSpy).not.toBeCalled();
    ActionRegistry.run({ method: 'POST' }, null);
    expect(requestSpy).toBeCalledTimes(1);
  });
});
