import { Observable, Subscription } from "rxjs";
import Joi from "@hapi/joi";

export type NetworkType = "laminarChain" | "ethereum";

export interface GuardianInterface {
  validationSchema: Joi.Schema;
  validateConfig<T>(config: T): T;
  monitors: MonitorInterface[];
  start(): void;
  stop(): void;
}

export interface MonitorInterface {
  name: string;
  config: MonitorConfig;
  task: TaskInterface;
  rawOutput$: Observable<any>;
  output$: Observable<any>;
  post(action: ActionPOST, result: any): void;
  script(action: ActionScript, result: any): void;
  listen(): Subscription;
}

export interface TaskInterface {
  validationSchema: Joi.Schema;
  validateParameters<T>(params?: T): T;
  call(params?: any): Observable<any>;
}

export interface LaminarGuardianConfig {
  nodeEndpoint: string;
  network: "dev" | "turbulence" | "reynolds" | "mainnet";
  confirmation: "finalize" | number;
  monitors: {
    [key: string]: MonitorConfig;
  };
}

export interface EthereumGuardianConfig {
  nodeEndpoint: string;
  network: "dev" | "kovan" | "mainnet";
  monitors: {
    [key: string]: MonitorConfig;
  };
}

export type ActionScript = {
  method: "script";
  path: string;
};

export type ActionPOST = {
  method: "POST";
  url: string;
  headers?: any;
};

export interface MonitorConfig {
  task: string;
  arguments?: any;
  conditions?: object;
  actions: (ActionScript | ActionPOST)[];
}
