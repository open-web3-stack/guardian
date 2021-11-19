import { logger } from '../utils';
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
  private static actions: Record<string, Action> = {
    POST,
    script
  };

  /**
   * Register an action
   *
   * @static
   * @param {string} method
   * @param {Action} action
   * @memberof ActionRegistry
   */
  public static register(method: string, action: Action) {
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
   * @returns {(Action | undefined)}
   * @memberof ActionRegistry
   */
  public static get(method: string): Action | undefined {
    return ActionRegistry.actions[method];
  }

  /**
   * Get action for method or throw if it doesn't exists
   *
   * @static
   * @param {string} method
   * @returns {Action}
   * @memberof ActionRegistry
   */
  public static getOrThrow(method: string): Action {
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
  public static run(action: { method: string; [key: string]: any }, data: any, guardianMetadata: any) {
    const metadata = { ...guardianMetadata, action };
    logger.info({ data, metadata });
    ActionRegistry.getOrThrow(action.method)(data, metadata);
  }
}
