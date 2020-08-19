import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { IMonitor, MonitorConfig, IGuardian } from './types';
import conditionBuilder from './conditions/condition-builder';
import { ActionRegistry } from './actions/ActionRegistry';
import { logger } from './utils';

export default class Monitor implements IMonitor {
  constructor(public readonly name: string, public readonly config: MonitorConfig) {}

  /// listen to output$ and trigger actions
  async start(guardian: IGuardian): Promise<Subscription> {
    logger.log(`[${this.name}] starting ...`);

    const TaskClass = guardian.getTaskOrThrow(this.config.task);

    const task = new TaskClass(this.config.arguments);

    // create raw output$
    const rawOutput$ = await task.start(guardian);

    const condition = this.config.conditions && conditionBuilder(this.config.conditions);

    // create filtered output$
    const output$ = rawOutput$.pipe(
      // apply condition if any
      filter((result) => (condition ? condition(result) : true)),
      tap((i) => logger.log(`[${this.name}] output: `, i))
    );

    const subscription = output$.subscribe((data: any) => {
      this.config.actions.forEach((action) => {
        logger.log(`[${this.name}] called [${action.method}]`);
        // run action
        ActionRegistry.run(action, data);
      });
    });

    logger.log(`[${this.name}] is running ...`);

    return subscription;
  }
}
