import { Action } from '../types';
import POST from './POST';
import script from './script';

/**
 * Action registry used for registring and running actions.
 *
 * @export
 * @class ActionRegistry
 */
export class ActionRegistry {
  private static actions: { [key: string]: Action<any> } = {
    POST,
    script,
  };

  /**
   * Register an action
   *
   * @static
   * @param {string} method
   * @param {Action<any>} action
   * @memberof ActionRegistry
   */
  public static register(method: string, action: Action<any>) {
    if (method.length === 0) {
      throw Error('method is not defined!');
    }

    if (ActionRegistry.actions[method]) {
      throw Error(`Action ${method} is already registered!`);
    }

    ActionRegistry.actions[method] = action;
  }

  /**
   * Get action for method
   *
   * @static
   * @param {string} method
   * @returns {(Action<any> | undefined)}
   * @memberof ActionRegistry
   */
  public static get(method: string): Action<any> | undefined {
    return ActionRegistry.actions[method];
  }

  /**
   * Get action for method or throw if it doesn't exists
   *
   * @static
   * @param {string} method
   * @returns {Action<any>}
   * @memberof ActionRegistry
   */
  public static getOrThrow(method: string): Action<any> {
    const instance = ActionRegistry.get(method);
    if (!instance) {
      throw Error(`Action ${method} not found!`);
    }
    return instance;
  }

  /**
   * Run action
   *
   * @static
   * @param {{ method: string; [key: string]: any }} action {method, ...args}
   * @param {*} data
   * @memberof ActionRegistry
   */
  public static run(action: { method: string; [key: string]: any }, data: any) {
    const { method, ...args } = action;
    ActionRegistry.getOrThrow(method)(args, data);
  }
}
