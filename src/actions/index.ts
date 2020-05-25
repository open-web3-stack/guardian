import { ActionRegistry } from './ActionRegistry';
import ScriptRunner from './ScriptRunner';
import POSTRunner from './POSTRunner';

export const registerActionRunners = () => {
  ActionRegistry.register(ScriptRunner);
  ActionRegistry.register(POSTRunner);
};

export { ActionRegistry };
