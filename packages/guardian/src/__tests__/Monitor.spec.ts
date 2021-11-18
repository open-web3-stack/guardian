import '../tasks/laminar/__tests__/__mocks__/mockPools';

import path from 'path';
import axios from 'axios';
import shell from 'shelljs';
import { LaminarGuardian } from '../guardians';
import { sleep } from '../utils';

jest.mock('axios');
jest.mock('shelljs');

describe('LaminarGuardian', () => {
  jest.setTimeout(30_000);

  axios.request = jest.fn();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  shell.exec = jest.fn(() => ({
    stdin: {
      write: jest.fn(),
      end: jest.fn()
    }
  }));

  const axiosSpy = jest.spyOn(axios, 'request');
  const shellSpy = jest.spyOn(shell, 'exec');

  beforeEach(() => {
    axiosSpy.mockClear();
    shellSpy.mockClear();
  });

  it('margin poolInfo should work', async (done) => {
    const guardian = new LaminarGuardian({
      chain: 'laminar',
      network: 'dev',
      nodeEndpoint: 'ws://localhost:9944',
      monitors: {
        'monitor-poolInfo': {
          task: 'margin.poolInfo',
          arguments: {
            poolId: 0
          },
          actions: [
            {
              method: 'script',
              path: path.resolve(__dirname, 'test.sh')
            }
          ]
        }
      }
    });

    await guardian.start();

    await sleep(300);

    expect(axiosSpy).toBeCalledTimes(0);
    expect(shellSpy).toBeCalledTimes(1);

    done();
  });

  it('synthetic liquidityPool should work', async (done) => {
    const guardian = new LaminarGuardian({
      chain: 'laminar',
      network: 'dev',
      nodeEndpoint: 'ws://localhost:9944',
      monitors: {
        'monitor-liquidityPool': {
          task: 'synthetic.liquidityPool',
          arguments: {
            poolId: 0,
            currencyId: ['FEUR']
          },
          conditions: [{ liquidity: '>= 1000' }],
          actions: [
            {
              method: 'POST',
              url: 'http://localhost:8080'
            },
            {
              method: 'script',
              path: path.resolve(__dirname, 'test.sh')
            }
          ]
        }
      }
    });

    await guardian.start();

    await sleep(300);

    expect(axiosSpy).toBeCalledTimes(1);
    expect(shellSpy).toBeCalledTimes(1);

    done();
  });
});
