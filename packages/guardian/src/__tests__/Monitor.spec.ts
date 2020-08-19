jest.mock('axios');
jest.mock('shelljs');

import './__mocks__/mockLaminarApi';
import './__mocks__/mockApiPromise';

import path from 'path';
import axios from 'axios';
import shell from 'shelljs';
import { LaminarGuardian } from '../guardians';
import { sleep } from '../utils';

describe('LaminarGuardian', () => {
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
    const guardian = new LaminarGuardian('laminar-guardian', {
      networkType: 'laminarChain',
      network: 'dev',
      nodeEndpoint: 'ws://localhost:9944',
      monitors: {
        'monitor-poolInfo': {
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
        },
      },
    });

    await guardian.start();

    expect(axiosSpy).toBeCalledTimes(0);
    expect(shellSpy).toBeCalledTimes(1);

    done();
  });

  it('synthetic liquidityPool should work', async (done) => {
    const guardian = new LaminarGuardian('laminar-guardian', {
      networkType: 'laminarChain',
      network: 'dev',
      nodeEndpoint: 'ws://localhost:9944',
      confirmation: 'finalize',
      monitors: {
        'monitor-liquidityPool': {
          task: 'synthetic.liquidityPool',
          arguments: {
            poolId: 0,
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
        },
      },
    });

    await guardian.start();

    await sleep(300);

    expect(axiosSpy).toBeCalledTimes(1);
    expect(shellSpy).toBeCalledTimes(1);

    done();
  });
});
