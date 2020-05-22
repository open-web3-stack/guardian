import { IAction } from '../types';

export class ActionRegistry {
  private static actions: { [key: string]: IAction<any> } = {};

  public static register<T extends IAction<any>>(action: new () => T) {
    const instance = new action();
    const { method } = instance;

    if (typeof method !== 'string' || method.length === 0) {
      throw Error('IAction.method is not defined!');
    }

    if (ActionRegistry.actions[method]) {
      throw Error(`Action ${method} is already registered!`);
    }

    ActionRegistry.actions[method] = instance;
  }

  public static get(method: string): IAction<any> {
    return ActionRegistry.actions[method];
  }

  public static getOrThrow(method: string): IAction<any> {
    const instance = ActionRegistry.get(method);
    if (!instance) {
      throw Error(`Action ${method} not found!`);
    }
    return instance;
  }

  public static run(action: { method: string; [key: string]: any }, data: any) {
    const { method, ...args } = action;
    ActionRegistry.getOrThrow(method).run(args, data);
  }
}
