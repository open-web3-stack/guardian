import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { ApiRx, WsProvider } from '@polkadot/api';
import { options } from '@laminar/api/laminar/options';
import { utils } from '@open-web3/guardian';
import { RPCRefreshPeriod } from '../../../constants';
import Big from 'big.js';

describe('getOraclePrice', () => {
  const ws = new WsProvider([
    'wss://testnet-node-1.laminar-chain.laminar.one/ws',
    'wss://node-6787234140909940736.jm.onfinality.io/ws'
  ]);

  afterAll(async () => {
    await ws.disconnect();
  });

  it('should get the price', async () => {
    const apiRx = await firstValueFrom(ApiRx.create(options({ provider: ws }) as any));
    const oraclePrice = utils.getOraclePrice(apiRx, RPCRefreshPeriod, { AUSD: Big(1e18) });
    const FEUR = apiRx.createType('CurrencyId', 'FEUR');
    const output = await firstValueFrom(oraclePrice(FEUR).pipe(take(1)));
    console.log(output.toString());
    expect(output).toBeTruthy();
  }, 60_000);
});
