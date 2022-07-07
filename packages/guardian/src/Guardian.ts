import * as Joi from 'joi';
import { Subscription, AsyncSubject, firstValueFrom } from 'rxjs';
import { IGuardian, IMonitor, GuardianConfig, ITaskConstructor } from './types';
import Monitor from './Monitor';
import { logger } from './utils';

export default abstract class Guardian<Config extends GuardianConfig = GuardianConfig, Props = Record<string, unknown>>
  implements IGuardian
{
  public readonly chain: string;

  public readonly monitors: IMonitor[] = [];

  // config validation schema
  public abstract validationSchema(): Joi.Schema;

  // list of tasks the guardian can run
  public abstract tasks(): { [key: string]: ITaskConstructor };

  public getTaskOrThrow(task: string): ITaskConstructor {
    const TaskClass = this.tasks()[task];
    if (!TaskClass) {
      throw new Error(`Guardian [${this.chain}] cannot find task [${task}]`);
    }
    return TaskClass;
  }

  // Additional data passed to actions
  protected _metadata = {};

  // monitor subscriptions
  protected subscriptions: Subscription[] = [];

  protected props = new AsyncSubject<Props>();

  protected isSetup = false;

  /**
   * Creates an instance of Guardian.
   * @param {GuardianConfig} config
   * @memberof Guardian
   */
  constructor(config: Config) {
    config = this.validateConfig(config);
    this.chain = config.chain;

    const { nodeEndpoint, chain } = config;
    this._metadata = { nodeEndpoint, chain };

    this.monitors = config.monitors.map((monitor, index) => {
      const identifier = monitor.id || `${this.chain}.monitor-${index}.${monitor.task}`;
      return new Monitor(identifier, monitor);
    });

    this.setup(config)
      .then((props) => {
        this.isSetup = true;
        this.props.next(props);
        this.props.complete();
      })
      .catch((error) => {
        this.props.error(error);
      });
  }

  // Guardian is ready to run tasks
  public isReady(): Promise<Props> {
    return firstValueFrom(this.props);
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

    logger.log(`🤖 [${this.chain}] is starting ...`);

    // wait until guardian is ready
    this.subscriptions = await Promise.all(this.monitors.map((monitor) => monitor.start(this)));

    logger.log(`🤖 [${this.chain}] is ready 🚀`);
  };

  /**
   * Stop monitoring
   *
   * @memberof Guardian
   */
  public readonly stop = () => {
    this.subscriptions.map(({ unsubscribe }) => unsubscribe && unsubscribe());
    this.subscriptions = [];
    logger.log(`[${this.chain}] stopped`);
  };

  public abstract teardown(): Promise<void>;

  public get metadata(): any {
    return this._metadata;
  }
}
