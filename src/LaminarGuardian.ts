import joi from '@hapi/joi';
import { get } from 'lodash';
import { Subscription } from 'rxjs';
import { LaminarGuardianConfig } from './types';
import { createLaminarTasks } from './tasks';
import Monitor from './Monitor';
import Guardian from './Guardian';
import createLaminarApi from './tasks/laminarChain/createLaminarApi';

export default class LaminarGuardian extends Guardian {
  validationSchema = joi.any();
  private subscriptions: Subscription[] = [];
  public readonly name: string;

  constructor(name: string, config: LaminarGuardianConfig) {
    super();
    this.name = name;

    config = this.validateConfig(config);

    const api$ = createLaminarApi(config.nodeEndpoint);
    const tasks = createLaminarTasks(api$);

    this.monitors = Object.entries(config.monitors).map(([name, monitor]) => {
      const task = get(tasks, monitor.task, null);
      if (!task) {
        throw Error(`${name}.${monitor.task} not found`);
      }
      return new Monitor(name, 'laminarChain', task, monitor);
    });
  }

  start() {
    console.log(`Starting ${this.name}`);
    this.subscriptions.map((i) => i.unsubscribe()); // unsubscribe any current subscription
    this.subscriptions = this.monitors.map((monitor) => monitor.listen());
  }

  stop() {
    console.log(`Stopping ${this.name}`);
    this.subscriptions.map((i) => i.unsubscribe());
    this.subscriptions = [];
  }
}
