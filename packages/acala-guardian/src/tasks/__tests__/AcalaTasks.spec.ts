import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { describeWithAcala } from '@acala-network/e2e';

import { CollateralAuctionsTask, LoansTask, PoolsTask } from '..';
import { AcalaGuardian } from '../..';

describeWithAcala('Acala Tasks', (context) => {
  let guardian: AcalaGuardian;

  beforeAll(async () => {
    guardian = new AcalaGuardian({
      chain: 'acala',
      network: 'dev',
      nodeEndpoint: `ws://localhost:${context.wsPort}`,
      monitors: []
    });
  });

  afterAll(async () => {
    await guardian.teardown();
  });

  it('CollateralAuctionsTask', async () => {
    const task = new CollateralAuctionsTask({
      account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      currencyId: { Token: 'DOT' }
    });

    const output$ = await task.start(guardian);

    await context.setStorage({
      Auction: {
        AuctionsIndex: 1,
        Auctions: [
          [
            [0],
            {
              bid: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', 30],
              start: 1,
              end: 125
            }
          ]
        ]
      },
      AuctionManager: {
        CollateralAuctions: [
          [
            [0],
            {
              refundRecipient: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
              currencyId: { token: 'DOT' },
              initialAmount: 100,
              amount: 100,
              target: 20,
              startTime: 20
            }
          ]
        ]
      },
      CdpEngine: {
        DebitExchangeRate: [[[{ token: 'DOT' }], '100000000000000000']]
      },
      AcalaOracle: {
        Values: [
          [
            [{ token: 'DOT' }],
            {
              value: '300000000000000000000',
              timestamp: '12345'
            }
          ]
        ]
      }
    });

    const result = await firstValueFrom(output$.pipe(take(1)));
    expect(result).toStrictEqual({
      account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      currencyId: 'DOT',
      auctionId: 0,
      initialAmount: '100',
      amount: '100',
      target: '20',
      startTime: 20,
      endTime: 125,
      lastBidder: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      lastBid: '30'
    });
  }, 30_000);

  it('LoansTask', async () => {
    const task = new LoansTask({
      account: 't6X8qpY26nsi6WDMkhbyaTz6cLtNBt7xfs4H9k94D3kM1Lm',
      currencyId: { token: 'DOT' }
    });

    const output$ = await task.start(guardian);

    await context.setStorage({
      Dex: {
        LiquidityPool: [
          [[[{ token: 'AUSD' }, { token: 'RENBTC' }]], ['100000000000000000000', '400000000000000000000']]
        ]
      },
      Loans: {
        Positions: [
          [
            [{ token: 'DOT' }, 't6X8qpY26nsi6WDMkhbyaTz6cLtNBt7xfs4H9k94D3kM1Lm'],
            { debit: '2500000000000000', collateral: '10000000000' }
          ]
        ]
      },
      CdpEngine: {
        DebitExchangeRate: [[[{ token: 'DOT' }], '100000000000000000']]
      },
      AcalaOracle: {
        Values: [
          [
            [{ token: 'DOT' }],
            {
              value: '300000000000000000000',
              timestamp: '12345'
            }
          ]
        ]
      }
    });

    const output = await firstValueFrom(output$.pipe(take(1)));
    expect(output).toStrictEqual({
      account: 't6X8qpY26nsi6WDMkhbyaTz6cLtNBt7xfs4H9k94D3kM1Lm',
      currencyId: '{"token":"DOT"}',
      debits: '2500000000000000',
      debitsUSD: '250000000000000',
      collaterals: '10000000000',
      collateralRatio: '1.2'
    });
  }, 30_000);

  it('PoolsTask', async () => {
    const task = new PoolsTask({
      currencyId: { token: 'DOT' }
    });

    const output$ = await task.start(guardian);

    await context.setStorage({
      Dex: {
        LiquidityPool: [[[[{ token: 'AUSD' }, { token: 'DOT' }]], ['100000000000000000000', '400000000000000000000']]]
      }
    });

    expect(await firstValueFrom(output$.pipe(take(1)))).toStrictEqual({
      currencyId: '[{"token":"AUSD"},{"token":"DOT"}]',
      price: '2500000000000000',
      baseLiquidity: '100000000000000000000',
      otherLiquidity: '400000000000000000000'
    });
  }, 30_000);
});
