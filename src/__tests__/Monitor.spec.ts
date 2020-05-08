jest.mock('axios');

import axios from 'axios';
import { from } from 'rxjs';
import mockLaminarApi from './__mocks__/mockLaminarApi';
import Monitor from '../Monitor';
import { MonitorConfig } from '../types';
import { createLaminarApi } from '../tasks/laminarChain';
import { createLaminarTasks } from '../tasks';

describe('Laminar monitors', () => {
  mockLaminarApi({
    margin: {
      poolInfo: jest.fn((poolId) => {
        return from([
          {
            poolId,
            owners: 'asf',
            balance: '100',
            ell: '80',
            enp: '50',
          },
        ]);
      }),
    },
    synthetic: {
      allPoolIds: jest.fn(() => from([[1]])),
      poolInfo: jest.fn((poolId) => {
        return from([
          {
            poolId,
            owners: 'who',
            balance: '1000',
            options: [
              {
                additionalCollateralRatio: 1,
                askSpread: 1,
                bidSpread: 1,
                syntheticEnabled: true,
                tokenId: 'FEUR',
              },
            ],
          },
          {
            poolId,
            owners: 'who',
            balance: '1200',
            options: [
              {
                additionalCollateralRatio: 1,
                askSpread: 1,
                bidSpread: 1,
                syntheticEnabled: true,
                tokenId: 'FEUR',
              },
            ],
          },
        ]);
      }),
    },
  });

  const api$ = createLaminarApi('ws://localhost:9944');
  const tasks = createLaminarTasks(api$);

  jest.setTimeout(30_000);

  // @ts-ignore
  axios.request = jest.fn((config) => console.log(JSON.stringify(config)));

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

    const monitor = new Monitor('margin', 'laminarChain', tasks.margin.poolInfo, config);

    const scriptSpy = jest.spyOn(monitor, 'script');
    const postSpy = jest.spyOn(monitor, 'post');

    const subscription = monitor.listen();

    await monitor.output$.toPromise();

    expect(scriptSpy).toBeCalledTimes(1);
    expect(postSpy).toBeCalledTimes(0);

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

    const monitor = new Monitor('liquidityPool', 'laminarChain', tasks.synthetic.liquidityPool, config);

    const scriptSpy = jest.spyOn(monitor, 'script');
    const postSpy = jest.spyOn(monitor, 'post');

    const subscription = monitor.listen();

    await monitor.output$.toPromise();

    expect(scriptSpy).toBeCalledTimes(1);
    expect(postSpy).toBeCalledTimes(1);

    subscription.unsubscribe();
    done();
  });
});
