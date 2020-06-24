import { map } from 'rxjs/operators';
import { createLaminarApi } from '../../../laminarChain';
import { createAcalaApi } from '../../../acalaChain';
import BalancesTask from '../../BalancesTask';

describe('BalancesTask with laminarChain', () => {
  const api$ = createLaminarApi('wss://testnet-node-1.laminar-chain.laminar.one/ws').pipe(map((a) => a.api));
  const task = new BalancesTask(api$);

  jest.setTimeout(60_000);

  it('get laminar balance', (done) => {
    task
      .run({ account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', currencyId: ['FEUR'] })
      .subscribe((output) => {
        console.log(JSON.stringify(output, null, 2));
        expect(output).toBeTruthy();
        done();
      });
  });
});

describe('BalancesTask with acalaChain', () => {
  const api$ = createAcalaApi('wss://testnet-node-1.acala.laminar.one/ws');
  const task = new BalancesTask(api$);

  jest.setTimeout(60_000);

  it('get acala balance', (done) => {
    task
      .run({ account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', currencyId: 'AUSD' })
      .subscribe((output) => {
        console.log(JSON.stringify(output, null, 2));
        expect(output).toBeTruthy();
        done();
      });
  });
});
