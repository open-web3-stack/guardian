import Joi from '@hapi/joi';
import { Observable, Subscription } from 'rxjs';
import { laminarNetwork, acalaNetwork, ethereumNetwork } from '../constants';
export * from './output';

export interface IGuardian {
  validationSchema(): Joi.Schema;
  monitors: IMonitor[];
  start(): void;
  stop(): void;
}

export interface IMonitor {
  name: string;
  actions: ActionConfig[];
  task: ITask<any>;
  rawOutput$: Observable<any>;
  output$: Observable<any>;
  listen(): Subscription;
}

export interface ITask<Output> {
  run(params: any): Observable<any>;
  validateCallArguments<T>(args?: T): T;

  validationSchema(): Joi.Schema;
  init(params: any): Observable<Output>;
}

export type Action<Args> = (args: Args, data: any) => void;

export interface GuardianConfig {
  networkType: string;
  monitors: {
    [key: string]: MonitorConfig;
  };
  [key: string]: any;
}

export interface LaminarGuardianConfig extends GuardianConfig {
  networkType: 'laminarChain';
  nodeEndpoint: string | string[];
  network: typeof laminarNetwork[number];
  confirmation: 'finalize' | number;
}

export interface AcalaGuardianConfig extends GuardianConfig {
  networkType: 'acalaChain';
  nodeEndpoint: string | string[];
  network: typeof acalaNetwork[number];
  confirmation: 'finalize' | number;
}

export interface SubstrateGuardianConfig extends GuardianConfig {
  networkType: 'substrateChain';
  nodeEndpoint: string | string[];
  confirmation: 'finalize' | number;
}

export interface EthereumGuardianConfig extends GuardianConfig {
  networkType: 'ethereum';
  nodeEndpoint: string;
  network: typeof ethereumNetwork[number];
}

export interface ActionConfig {
  method: string;
  [key: string]: any;
}
export interface MonitorConfig {
  task: string;
  arguments?: any;
  conditions?: any[];
  actions: ActionConfig[];
}

export interface Config {
  version: string;
  guardians: {
    [name: string]:
      | LaminarGuardianConfig
      | AcalaGuardianConfig
      | SubstrateGuardianConfig
      | EthereumGuardianConfig
      | GuardianConfig;
  };
}
