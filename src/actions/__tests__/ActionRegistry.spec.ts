import { registerActions } from '../';
import { ActionRegistry } from '../ActionRegistry';
import ActionPOST from '../ActionPOST';
import ActionScript from '../ActionScript';

describe('ActionRegistry', () => {
  it('register default actions', () => {
    expect(() => ActionRegistry.getOrThrow('POST')).toThrow('Action POST not found!');
    expect(() => ActionRegistry.getOrThrow('script')).toThrow('Action script not found!');
    registerActions();
    expect(ActionRegistry.getOrThrow('POST')).toBeInstanceOf(ActionPOST);
    expect(ActionRegistry.getOrThrow('script')).toBeInstanceOf(ActionScript);
  });
});
