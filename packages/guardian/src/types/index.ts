import * as Joi from 'joi';
import { Observable, Subscription } from 'rxjs';
import { AnyJson } from '@polkadot/types/types';
import Task from '../Task';

export interface IGuardian {
  // List of monitors
  monitors: IMonitor[];

  // validation schema for the guardian config
  validationSchema(): Joi.Schema;

  // List of tasks the guardian can run
  tasks(): Record<string, TaskConstructor>;

  getTaskOrThrow(task: string): TaskConstructor;

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

export interface TaskConstructor<P extends Record<string, unknown> = Record<string, unknown>, O = unknown> {
  new (params: P): Task<P, O>;
}

export interface ITask<P extends Record<string, unknown>, O> {
  get arguments(): P;
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

export type SubstrateGuardianConfig = BaseSubstrateGuardianConfig;

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
  guardians: [BaseSubstrateGuardianConfig | GuardianConfig | any];
}

export type Balance = {
  account: string;
  currencyId: string;
  free: string;
  // reserved: string;
  // frozen: string;
};

export type Price = {
  key: string;
  value: string;
};

export type Event = {
  blockNumber: number;
  blockHash: string;
  phase: AnyJson;
  index: string;
  name: string;
  args: Record<string, any>;
};
