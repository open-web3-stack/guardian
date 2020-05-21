import axios from 'axios';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as shell from 'shelljs';
import { NetworkType, MonitorInterface, MonitorConfig, TaskInterface, ActionPOST, ActionScript } from './types';
import conditionBuilder from './conditions/condition-builder';

export default class Monitor implements MonitorInterface {
  public readonly name: string;
  public readonly network: NetworkType;
  public readonly task: TaskInterface<any>;
  public readonly config: MonitorConfig;
  public readonly rawOutput$: Observable<any>;
  public readonly output$: Observable<any>;

  constructor(name: string, network: NetworkType, task: TaskInterface<any>, config: MonitorConfig) {
    this.name = name;
    this.network = network;
    this.task = task;
    this.config = config;

    const condition = config.conditions && conditionBuilder(config.conditions);

    // create raw output$
    this.rawOutput$ = this.task.run(config.arguments);

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
    console.log(`Task [${this.name}] called POST [${url}]`);
  }

  /// action script
  script(action: ActionScript, data: any) {
    const child = shell.exec(action.path, { async: true });
    child.stdin.write(JSON.stringify(data));
    child.stdin.end();
    console.log(`Task [${this.name}] called script [${action.path}]`);
  }

  /// listen to output$ and trigger the actions
  listen(): Subscription {
    console.log(`Task [${this.name}] is running...`);
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
