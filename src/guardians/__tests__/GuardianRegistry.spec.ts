import Joi from '@hapi/joi';
import GuardianRegistry from '../GuardianRegistry';
import { LaminarGuardian, AcalaGuardian } from '../';
import { LaminarGuardianConfig, AcalaGuardianConfig, SubstrateGuardianConfig, GuardianConfig } from '../../types';
import Guardian from '../Guardian';
import EventsTask from '../../tasks/substrate/EventsTask';
import { createAcalaApi } from '../../tasks/acalaChain';

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

class CustomGuardian extends Guardian {
  validationSchema() {
    return Joi.any();
  }

  getTasks(config: SubstrateGuardianConfig) {
    const api$ = createAcalaApi(config.nodeEndpoint);
    return { foo: { bar: new EventsTask(api$) } };
  }
}

describe('GuardianRegistry', () => {
  it('works with custom Guardian', () => {
    GuardianRegistry.register('customChain', CustomGuardian);

    const customGuardian = GuardianRegistry.create('customChain', 'customGuardian', customConfig);

    expect(customGuardian).toBeInstanceOf(CustomGuardian);
    expect(() => customGuardian.start()).not.toThrowError();
    customGuardian.stop();
  });

  it('works', () => {
    const laminarGuardian = GuardianRegistry.create('laminarChain', 'laminarGuardian', laminarConfig);
    const acalaGuardian = GuardianRegistry.create('acalaChain', 'acalaGuardian', acalaConfig);

    expect(laminarGuardian).toBeInstanceOf(LaminarGuardian);
    expect(acalaGuardian).toBeInstanceOf(AcalaGuardian);

    expect(() => laminarGuardian.start()).not.toThrowError();
    expect(() => acalaGuardian.start()).not.toThrowError();

    laminarGuardian.stop();
    acalaGuardian.stop();
  });
});
