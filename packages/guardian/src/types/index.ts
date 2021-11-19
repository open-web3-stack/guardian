import Joi from 'joi';
import { Observable, Subscription } from 'rxjs';
import { laminarNetwork, acalaNetwork, ethereumNetwork } from '../constants';
export * from './output';

export interface IGuardian {
  // List of monitors
  monitors: IMonitor[];

  // validation schema for the guardian config
  validationSchema(): Joi.Schema;

  // List of tasks the guardian can run
  tasks(): { [key: string]: ITaskConstructor };

  getTaskOrThrow(task: string): ITaskConstructor;

  // Guardian is ready to run
  isReady(): Promise<any>;

  // Internal guardian setup. Gets called on constructor
  setup(config: GuardianConfig): Promise<any>;

  // Start guardian
  start(): Promise<void>;

  // Stop guardian
  stop(): void;

  // Additional data passed to action
  metadata: Record<string, unknown>;
}

export interface IMonitor {
  name: string;
  config: MonitorConfig;
  start(guardian: IGuardian): Promise<Subscription>;
}

export interface ITaskConstructor {
  new (_arguments: any): ITask<any, any>;
}

export interface ITask<P extends Record<string, any>, O> {
  arguments: P;
  setArguments(args: P): void;
  validationSchema(): Joi.Schema;
  start(guardian: IGuardian): Promise<Observable<O>>;
}

export type Action = (data: any, metadata: any) => void;

export interface GuardianConfig {
  chain: string;
  monitors: MonitorConfig[];
  [key: string]: any;
}

export interface BaseSubstrateGuardianConfig extends GuardianConfig {
  nodeEndpoint: string | string[];
  // confirmation?: 'finalize' | number;
}

export interface LaminarGuardianConfig extends BaseSubstrateGuardianConfig {
  network: typeof laminarNetwork[number];
}

export interface AcalaGuardianConfig extends BaseSubstrateGuardianConfig {
  network: typeof acalaNetwork[number];
}

export type SubstrateGuardianConfig = BaseSubstrateGuardianConfig;

export interface EthereumGuardianConfig extends GuardianConfig {
  nodeEndpoint: string;
  network: typeof ethereumNetwork[number];
}

export interface ActionConfig {
  method: string;
  [key: string]: any;
}
export interface MonitorConfig {
  id?: string;
  task: string;
  arguments?: any;
  conditions?: any[];
  actions: ActionConfig[];
}

export interface Config {
  version: string;
  guardians: [
    LaminarGuardianConfig | AcalaGuardianConfig | SubstrateGuardianConfig | EthereumGuardianConfig | GuardianConfig
  ];
}
