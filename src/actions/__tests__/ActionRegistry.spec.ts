import { registerActionRunners } from '../';
import { ActionRegistry } from '../ActionRegistry';
import POSTRunner from '../POSTRunner';
import ScriptRunner from '../ScriptRunner';

describe('ActionRegistry', () => {
  it('register default actions', () => {
    expect(() => ActionRegistry.getOrThrow('POST')).toThrow('Action POST not found!');
    expect(() => ActionRegistry.getOrThrow('script')).toThrow('Action script not found!');
    registerActionRunners();
    expect(ActionRegistry.getOrThrow('POST')).toBeInstanceOf(POSTRunner);
    expect(ActionRegistry.getOrThrow('script')).toBeInstanceOf(ScriptRunner);
  });
});
