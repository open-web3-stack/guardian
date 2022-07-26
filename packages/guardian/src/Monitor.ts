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
    const TaskClass = guardian.getTaskOrThrow(this.config.task);

    const task = new TaskClass(this.config.arguments);

    // create raw output$
    const rawOutput$ = await task.start(guardian);

    const condition = this.config.conditions ? conditionBuilder(this.config.conditions) : (d: any) => d;

    // create filtered output$
    const output$ = rawOutput$.pipe(
      tap((data) => logger.debug(`🔭 [${this.name}] event:`, data)),
      // apply condition if any
      filter(condition)
    );

    const subscription = output$.subscribe((data: any) => {
      this.config.actions.forEach((action) => {
        logger.log(`🔭 [${this.name}] called [${action.method}]`);
        // run action
        ActionRegistry.run(action, data, guardian.metadata);
      });
    });

    logger.log(`🔭 [${this.name}] is running ...`);

    return subscription;
  }
}
