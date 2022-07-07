import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { AcalaGuardian } from '@open-web3/acala-guardian';
import PricesTask from '../../PricesTask';

describe('PricesTask', () => {
  jest.setTimeout(30_000);

  const guardian = new AcalaGuardian({
    chain: 'acala',
    network: 'mandala',
    monitors: []
  } as any);

  afterAll(async () => {
    await guardian.teardown();
  });

  it('get oracle value', async () => {
    const task = new PricesTask({ key: { token: 'DOT' }, period: 1000 });
    const output$ = await task.start(guardian as any);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output);
    expect(output).toBeTruthy();
  });

  it('get stableCoin price', async () => {
    const task = new PricesTask({ key: { token: 'AUSD' }, period: 1000 });
    const output$ = await task.start(guardian as any);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output);
    expect(output).toEqual({
      key: '{"token":"AUSD"}',
      value: '1000000000000000000'
    });
  });

  it('get oracle values [DOT, ACA]', async () => {
    const task = new PricesTask({ key: [{ token: 'DOT' }, { token: 'ACA' }], period: 1000 });
    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output);
    expect(output).toBeTruthy();
  });

  it('get all oracle values', async () => {
    const task = new PricesTask({ key: 'all', period: 1000 });
    const output$ = await task.start(guardian);
    const output = await firstValueFrom(output$.pipe(take(1)));
    console.log(output);
    expect(output).toBeTruthy();
  });
});
