import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IMonitor, MonitorConfig, IGuardian } from './types';
import conditionBuilder from './conditions/condition-builder';
import { ActionRegistry } from './actions/ActionRegistry';

export default class Monitor implements IMonitor {
  constructor(public readonly name: string, public readonly config: MonitorConfig) {}

  /// listen to output$ and trigger actions
  async start(guardian: IGuardian): Promise<Subscription> {
    console.log(`Starting task [${this.name}] ...`);

    const TaskClass = guardian.getTaskOrThrow(this.config.task);

    const task = new TaskClass(this.config.arguments);

    // create raw output$
    const rawOutput$ = await task.start(guardian);

    const condition = this.config.conditions && conditionBuilder(this.config.conditions);

    // create filtered output$
    const output$ = rawOutput$.pipe(
      // apply condition if any
      filter((result) => (condition ? condition(result) : true))
    );

    const subscription = output$.subscribe((data: any) => {
      this.config.actions.forEach((action) => {
        console.log(`Task [${this.name}] called [${action.method}]`);
        // run action
        ActionRegistry.run(action, data);
      });
    });

    console.log(`Task [${this.name}] is running ...`);

    return subscription;
  }
}
