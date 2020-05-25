jest.mock('axios');
jest.mock('shelljs');

import axios from 'axios';
import shell from 'shelljs';
import mockLaminarApi from './__mocks__/mockLaminarApi';
import Monitor from '../Monitor';
import { MonitorConfig } from '../types';
import { createLaminarApi } from '../tasks/laminarChain';
import { createLaminarTasks } from '../tasks';
import { registerActionRunners } from '../actions';

describe('Laminar monitors', () => {
  mockLaminarApi();

  const api$ = createLaminarApi('ws://localhost:9944');
  const tasks = createLaminarTasks(api$);

  jest.setTimeout(30_000);

  registerActionRunners();

  // @ts-ignore
  axios.request = jest.fn();

  // @ts-ignore
  shell.exec = jest.fn(() => ({
    stdin: {
      write: jest.fn(),
      end: jest.fn(),
    },
  }));

  const axiosSpy = jest.spyOn(axios, 'request');
  const shellSpy = jest.spyOn(shell, 'exec');

  beforeEach(() => {
    axiosSpy.mockClear();
    shellSpy.mockClear();
  });

  it('margin poolInfo should work', async (done) => {
    const config: MonitorConfig = {
      task: 'margin.poolInfo',
      arguments: {
        poolId: 1,
      },
      actions: [
        {
          method: 'script',
          path: './src/__tests__/test.sh',
        },
      ],
    };

    const monitor = new Monitor('margin.poolInfo', tasks.margin.poolInfo, config);

    const subscription = monitor.listen();

    await monitor.output$.toPromise();

    expect(axiosSpy).toBeCalledTimes(0);
    expect(shellSpy).toBeCalledTimes(1);

    subscription.unsubscribe();

    done();
  });

  it('synthetic liquidityPool should work', async (done) => {
    const config: MonitorConfig = {
      task: 'synthetic.liquidityPool',
      arguments: {
        poolId: 'all',
        currencyId: ['FEUR', 'FJPY', 'FBTC'],
      },
      conditions: [{ balance: '> 1000' }],
      actions: [
        {
          method: 'POST',
          url: 'http://localhost:8080',
        },
        {
          method: 'script',
          path: './src/__tests__/test.sh',
        },
      ],
    };

    const monitor = new Monitor('synthetic.liquidityPool', tasks.synthetic.liquidityPool, config);

    const subscription = monitor.listen();

    await monitor.output$.toPromise();

    expect(axiosSpy).toBeCalledTimes(1);
    expect(shellSpy).toBeCalledTimes(1);

    subscription.unsubscribe();
    done();
  });
});
