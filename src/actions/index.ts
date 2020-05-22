import { ActionRegistry } from './ActionRegistry';
import ActionScript from './ActionScript';
import ActionPOST from './ActionPOST';

export const registerActions = () => {
  ActionRegistry.register(ActionScript);
  ActionRegistry.register(ActionPOST);
};

export { ActionRegistry };
