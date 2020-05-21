import Joi from '@hapi/joi';
import { get } from 'lodash';
import { Subscription, AsyncSubject } from 'rxjs';
import { ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { SubstrateGuardianConfig } from '../types';
import { createSubstrateTasks } from '../tasks';
import Monitor from '../Monitor';
import Guardian from './Guardian';

const createApi = (nodeEndpoint: string | string[]) => {
  const api$ = new AsyncSubject<ApiRx>();
  const api = new ApiRx({ provider: new WsProvider(nodeEndpoint) });
  api.once('ready', () => {
    api$.next(api);
    api$.complete();
  });
  return api$;
};

export default class SubstrateGuardian extends Guardian {
  validationSchema = Joi.any();
  private subscriptions: Subscription[] = [];
  public readonly name: string;

  constructor(name: string, config: SubstrateGuardianConfig) {
    super();
    this.name = name;

    config = this.validateConfig(config);

    const api$ = createApi(config.nodeEndpoint);
    const tasks = createSubstrateTasks(api$);

    this.monitors = Object.entries(config.monitors).map(([name, monitor]) => {
      const task = get(tasks, monitor.task, null);
      if (!task) {
        throw Error(`${name}.${monitor.task} not found`);
      }
      return new Monitor(name, 'acalaChain', task, monitor);
    });
  }

  start() {
    console.log(`Starting guardian ${this.name} ...`);
    this.subscriptions.map((i) => i.unsubscribe()); // unsubscribe any current subscription
    this.subscriptions = this.monitors.map((monitor) => monitor.listen());
  }

  stop() {
    console.log(`Stopping guardian ${this.name} ...`);
    this.subscriptions.map((i) => i.unsubscribe());
    this.subscriptions = [];
  }
}
