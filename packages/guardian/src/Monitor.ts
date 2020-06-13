import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IMonitor, MonitorConfig, ITask, ActionConfig } from './types';
import conditionBuilder from './conditions/condition-builder';
import { ActionRegistry } from './actions/ActionRegistry';

export default class Monitor implements IMonitor {
  public readonly name: string;
  public readonly task: ITask<any>;
  public readonly actions: ActionConfig[];
  public readonly rawOutput$: Observable<any>;
  public readonly output$: Observable<any>;

  constructor(name: string, task: ITask<any>, config: MonitorConfig) {
    this.name = name;
    this.task = task;
    this.actions = config.actions;

    const condition = config.conditions && conditionBuilder(config.conditions);

    // create raw output$
    this.rawOutput$ = this.task.run(config.arguments);

    // create filtered output$
    this.output$ = this.rawOutput$.pipe(
      // apply condition if any
      filter((result) => (condition ? condition(result) : true))
    );
  }

  /// listen to output$ and trigger the actions
  listen(): Subscription {
    console.log(`Task [${this.name}] is running ...`);

    return this.output$.subscribe((data: any) => {
      this.actions.forEach((action) => {
        console.log(`Task [${this.name}] called [${action.method}]`);
        // run action
        ActionRegistry.run(action, data);
      });
    });
  }
}
