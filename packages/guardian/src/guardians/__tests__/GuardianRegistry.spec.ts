import Joi from 'joi';
import { ApiRx, WsProvider } from '@polkadot/api';
import { Observable, firstValueFrom } from 'rxjs';
import GuardianRegistry from '../GuardianRegistry';
import { LaminarGuardian, AcalaGuardian, Guardian } from '..';
import { LaminarGuardianConfig, AcalaGuardianConfig, GuardianConfig, BaseSubstrateGuardianConfig } from '../../types';
import EventsTask from '../../tasks/substrate/EventsTask';
import Task from '../../tasks/Task';

const laminarConfig: LaminarGuardianConfig = {
  networkType: 'laminarChain',
  network: 'dev',
  nodeEndpoint: 'ws://localhost:9944',
  confirmation: 'finalize',
  monitors: {
    marginMonitor: {
      task: 'margin.poolInfo',
      arguments: { poolId: 1 },
      actions: [{ method: 'POST', url: 'localhost' }],
    },
  },
};

const acalaConfig: AcalaGuardianConfig = {
  networkType: 'acalaChain',
  network: 'dev',
  nodeEndpoint: 'ws://localhost:9944',
  confirmation: 'finalize',
  monitors: {
    events: {
      task: 'system.events',
      arguments: { name: 'balances.Deposit' },
      actions: [{ method: 'POST', url: 'localhost' }],
    },
  },
};

const customConfig: GuardianConfig = {
  networkType: 'customChain',
  nodeEndpoint: 'ws://localhost:9944',
  monitors: {
    events: {
      task: 'foo.bar',
      arguments: { name: 'helloworld' },
      actions: [{ method: 'POST', url: 'localhost' }],
    },
  },
};

class BarTask extends Task<{name: string}, boolean> {
  validationSchema() {
    return Joi.any();
  }

  async start(guardian: Guardian) {
    const {} = await guardian.isReady();
    return new Observable<boolean>();
  }
}

class CustomGuardian extends Guardian<BaseSubstrateGuardianConfig> {
  tasks() {
    return {
      'system.event': EventsTask,
      'foo.bar': BarTask,
    };
  }

  async setup(config: BaseSubstrateGuardianConfig) {
    const ws = new WsProvider(config.nodeEndpoint);
    const apiRx = await firstValueFrom(ApiRx.create({ provider: ws }));
    return { apiRx };
  }

  validationSchema() {
    return Joi.any();
  }
}

describe('GuardianRegistry', () => {
  it('works with custom Guardian', () => {
    GuardianRegistry.register('customChain', CustomGuardian);

    const customGuardian = GuardianRegistry.create('customChain', 'custom-guardian', customConfig);

    expect(customGuardian).toBeInstanceOf(CustomGuardian);
    expect(async () => await customGuardian.start()).not.toThrowError();
    customGuardian.stop();
  });

  it('works', () => {
    const laminarGuardian = GuardianRegistry.create('laminarChain', 'laminar-guardian', laminarConfig);
    const acalaGuardian = GuardianRegistry.create('acalaChain', 'acala-guardian', acalaConfig);

    expect(laminarGuardian).toBeInstanceOf(LaminarGuardian);
    expect(acalaGuardian).toBeInstanceOf(AcalaGuardian);

    expect(async () => await laminarGuardian.start()).not.toThrowError();
    expect(async () => await acalaGuardian.start()).not.toThrowError();

    laminarGuardian.stop();
    acalaGuardian.stop();
  });
});
