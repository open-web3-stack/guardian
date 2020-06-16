import Joi from '@hapi/joi';
import { get } from 'lodash';
import { Subscription } from 'rxjs';
import { IGuardian, IMonitor, GuardianConfig } from '../types';
import Monitor from '../Monitor';
import Task from '../tasks/Task';

export default abstract class Guardian implements IGuardian {
  // user defined name
  public readonly name: string;

  // config validation schema
  public abstract validationSchema(): Joi.Schema;

  public readonly monitors: IMonitor[] = [];

  // monitor subscriptions
  private subscriptions: Subscription[] = [];

  /**
   * Creates an instance of Guardian.
   * @param {string} name
   * @param {GuardianConfig} config
   * @memberof Guardian
   */
  constructor(name: string, config: GuardianConfig) {
    this.name = name;
    config = this.validateConfig(config);

    const tasks = this.getTasks(config);

    this.monitors = Object.entries(config.monitors).map(([name, monitor]) => {
      const task = get(tasks, monitor.task, null);
      if (!task) {
        throw Error(`${name}.${monitor.task} not found`);
      }
      return new Monitor(`${name}.${monitor.task}`, task as any, monitor);
    });
  }

  /**
   * Tasks that the guardian can run
   *
   * @abstract
   * @param {GuardianConfig} config
   * @returns {{ [key: string]: any }}
   * @memberof Guardian
   */
  public abstract getTasks(config: GuardianConfig): { [key: string]: { [key: string]: Task<any> } };

  /**
   * Validate guardian config
   *
   * @private
   * @template T
   * @param {T} config
   * @returns {T}
   * @memberof Guardian
   */
  private validateConfig<T>(config: T): T {
    const { error, value } = this.validationSchema().validate(config, { allowUnknown: true });
    if (error) {
      throw error;
    }
    return value;
  }

  /**
   * Start monitoring
   *
   * @memberof Guardian
   */
  public readonly start = () => {
    console.log(`Starting guardian [${this.name}] ...`);
    this.subscriptions.map((i) => i.unsubscribe()); // unsubscribe any current subscription
    this.subscriptions = this.monitors.map((monitor) => monitor.listen());
  };

  /**
   * Stop monitoring
   *
   * @memberof Guardian
   */
  public readonly stop = () => {
    console.log(`Stopping guardian [${this.name}] ...`);
    this.subscriptions.map((i) => i.unsubscribe());
    this.subscriptions = [];
  };
}
