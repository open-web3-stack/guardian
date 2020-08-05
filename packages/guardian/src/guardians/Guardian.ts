import Joi from '@hapi/joi';
import { Subscription, AsyncSubject } from 'rxjs';
import { logger } from '@polkadot/util';
import { IGuardian, IMonitor, GuardianConfig, ITaskConstructor } from '../types';
import Monitor from '../Monitor';

export const l = logger('guardian');

export default abstract class Guardian<Config extends GuardianConfig = GuardianConfig, Props = {}>
  implements IGuardian {
  public readonly monitors: IMonitor[] = [];

  // config validation schema
  public abstract validationSchema(): Joi.Schema;

  // list of tasks the guardian can run
  public abstract tasks(): { [key: string]: ITaskConstructor };

  public getTaskOrThrow(task: string): ITaskConstructor {
    const TaskClass = this.tasks()[task];
    if (!TaskClass) {
      throw new Error(`Guardian [${this.name}] cannot find task [${task}]`);
    }
    return TaskClass;
  }

  // monitor subscriptions
  private subscriptions: Subscription[] = [];

  private props = new AsyncSubject<Props>();

  /**
   * Creates an instance of Guardian.
   * @param {string} name
   * @param {GuardianConfig} _config
   * @memberof Guardian
   */
  constructor(public readonly name: string, config: Config) {
    config = this.validateConfig(config);

    this.monitors = Object.entries(config.monitors).map(([name, monitor]) => {
      const identifier = `${name}.${monitor.task}`;
      return new Monitor(identifier, monitor);
    });

    this.setup(config)
      .then((props) => {
        this.props.next(props);
        this.props.complete();
      })
      .catch((error) => {
        this.props.error(error);
      });
  }

  // Guardian is ready to run tasks
  public isReady(): Promise<Props> {
    return this.props.toPromise();
  }

  // Perform any necessary setup. This method gets called before running task
  public abstract setup(config: Config): Promise<Props>;

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
  public readonly start = async () => {
    // unsubscribe any current subscription
    this.subscriptions.map(({ unsubscribe }) => unsubscribe && unsubscribe());

    l.log(`[${this.name}] starting...`);

    // wait until guardian is ready
    this.subscriptions = await Promise.all(this.monitors.map((monitor) => monitor.start(this)));

    l.log(`[${this.name}] is running ...`);
  };

  /**
   * Stop monitoring
   *
   * @memberof Guardian
   */
  public readonly stop = () => {
    this.subscriptions.map(({ unsubscribe }) => unsubscribe && unsubscribe());
    this.subscriptions = [];
    l.log(`[${this.name}] stopped`);
  };
}
