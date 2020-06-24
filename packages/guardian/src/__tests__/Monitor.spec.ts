jest.mock('axios');
jest.mock('shelljs');

import path from 'path';
import axios from 'axios';
import shell from 'shelljs';
import mockLaminarApi from './__mocks__/mockLaminarApi';
import Monitor from '../Monitor';
import { MonitorConfig } from '../types';
import { createLaminarApi } from '../tasks/laminarChain';
import { createLaminarTasks } from '../tasks';

describe('Laminar monitors', () => {
  mockLaminarApi();

  const api$ = createLaminarApi('ws://localhost:9944');
  const tasks = createLaminarTasks(api$);

  jest.setTimeout(30_000);

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
          path: path.resolve(__dirname, 'test.sh'),
        },
      ],
    };

    const monitor = new Monitor('margin.poolInfo', tasks.margin.poolInfo, config);

    const subscription = monitor.listen();

    expect(axiosSpy).toBeCalledTimes(0);
    expect(shellSpy).toBeCalledTimes(1);

    subscription.unsubscribe();

    done();
  });

  it('synthetic liquidityPool should work', async (done) => {
    const config: MonitorConfig = {
      task: 'synthetic.liquidityPool',
      arguments: {
        poolId: '0',
        currencyId: ['FEUR'],
      },
      conditions: [{ liquidity: '>= 1000' }],
      actions: [
        {
          method: 'POST',
          url: 'http://localhost:8080',
        },
        {
          method: 'script',
          path: path.resolve(__dirname, 'test.sh'),
        },
      ],
    };

    const monitor = new Monitor('synthetic.liquidityPool', tasks.synthetic.liquidityPool, config);

    const subscription = monitor.listen();

    expect(axiosSpy).toBeCalledTimes(1);
    expect(shellSpy).toBeCalledTimes(1);

    subscription.unsubscribe();
    done();
  });
});
