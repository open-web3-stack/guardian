import axios from 'axios';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as shell from 'shelljs';
import { NetworkType, MonitorInterface, MonitorConfig, TaskInterface, ActionPOST, ActionScript } from './types';
import { getTask } from './tasks';
import conditionBuilder from './conditions/condition-builder';

export default class Monitor implements MonitorInterface {
  public readonly name: string;
  public readonly config: MonitorConfig;
  public readonly task: TaskInterface;
  public readonly rawOutput$: Observable<any>;
  public readonly output$: Observable<any>;

  constructor(name: string, network: NetworkType, config: MonitorConfig) {
    this.name = name;
    this.config = config;

    this.task = getTask(network, config.task);
    if (!this.task) {
      throw Error(`${name}:${config.task} not found`);
    }

    const condition = config.conditions && conditionBuilder(config.conditions);

    // create raw output$
    this.rawOutput$ = this.task.call(config.arguments);

    // create filtered output$
    this.output$ = this.rawOutput$.pipe(
      filter((result) => {
        if (condition) {
          return condition(result);
        }
        return true;
      })
    );
  }

  /// action post
  post(action: ActionPOST, data: any) {
    const { method, url, headers } = action;
    axios.request({ url, method, headers, data });
  }

  /// action script
  script(action: ActionScript, data: any) {
    const child = shell.exec(action.path, { async: true });
    child.stdin.write(JSON.stringify(data));
    child.stdin.end();
  }

  /// listen to output$ and trigger the actions
  listen(): Subscription {
    return this.output$.subscribe((result: any) => {
      this.config.actions.forEach((action) => {
        switch (action.method) {
          case 'script':
            this.script(action, result);
            break;
          case 'POST':
            this.post(action, result);
            break;
        }
      });
    });
  }
}
