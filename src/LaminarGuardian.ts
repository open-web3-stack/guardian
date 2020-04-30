import joi from '@hapi/joi';
import { Subscription } from 'rxjs';
import { LaminarGuardianConfig } from './types';
import { createLaminarApi } from './tasks/laminarChain/laminarApi';
import Monitor from './Monitor';
import Guardian from './Guardian';

export default class LaminarGuardian extends Guardian {
  validationSchema = joi.any();
  private subscriptions: Subscription[] = [];

  constructor(config: LaminarGuardianConfig) {
    super();

    config = this.validateConfig(config);

    createLaminarApi(config.nodeEndpoint);

    this.monitors = Object.entries(config.monitors).map(([name, monitor]) => {
      return new Monitor(name, 'laminarChain', monitor);
    });
  }

  start() {
    console.log('Running laminarChain guardian...');
    this.subscriptions.map((i) => i.unsubscribe()); // unsubscribe any current subscription
    this.subscriptions = this.monitors.map((monitor) => monitor.listen());
  }

  stop() {
    console.log('Stopping laminarChain guardian...');
    this.subscriptions.map((i) => i.unsubscribe());
    this.subscriptions = [];
  }
}
