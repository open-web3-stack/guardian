import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import LiquidityPoolTask from '../../LiquidityPoolTask';
import { LaminarGuardianConfig } from '../../../types';
import LaminarGuardian from '../../../LaminarGuardian';

describe('LiquidityPoolTask', () => {
  jest.setTimeout(60_000);

  const config: LaminarGuardianConfig = {
    chain: 'laminar',
    network: 'turbulence',
    monitors: []
  } as any;

  const guardian = new LaminarGuardian(config);

  afterAll(async () => {
    await guardian.teardown();
  });

  it('works with poolId and currencyId', async () => {
    const task = new LiquidityPoolTask({
      poolId: 0,
      currencyId: 'FEUR'
    });

    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output);
    expect(output).toBeTruthy();
  });

  it('works with poolId and currencyIds', async () => {
    const task = new LiquidityPoolTask({
      poolId: 0,
      currencyId: ['FEUR', 'FJPY']
    });

    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output);
    expect(output).toBeTruthy();
  });

  it('works with poolId and fTokens', async () => {
    const task = new LiquidityPoolTask({
      poolId: 0,
      currencyId: ['FEUR', 'FJPY']
    });

    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output);
    expect(output).toBeTruthy();
  });
});
