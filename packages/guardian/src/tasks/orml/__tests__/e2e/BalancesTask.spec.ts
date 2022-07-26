import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { AcalaGuardian } from '@open-web3/acala-guardian';
import BalancesTask from '../../BalancesTask';

describe('BalancesTask with acalaChain', () => {
  jest.setTimeout(60_000);

  const task = new BalancesTask({
    account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    currencyId: { token: 'AUSD' }
  });

  const guardian = new AcalaGuardian({
    chain: 'acala',
    network: 'karura',
    monitors: []
  } as any);

  afterAll(async () => {
    await guardian.teardown();
  });

  it('get acala balance', async () => {
    const stream$ = await task.start(guardian);
    const output = await firstValueFrom(stream$.pipe(take(1)));
    console.log(output);
    expect(output).toBeTruthy();
  });
});
