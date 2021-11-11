import { firstValueFrom } from 'rxjs';
import { ApiRx, WsProvider } from '@polkadot/api';
import { options } from '@laminar/api/laminar/options';
import getOraclePrice from '../../helpers/getOraclePrice';

describe('getOraclePrice', () => {
  it('should get the price', async (done) => {
    const ws = new WsProvider([
      'wss://testnet-node-1.laminar-chain.laminar.one/ws',
      'wss://node-6787234140909940736.jm.onfinality.io/ws'
    ]);
    const apiRx = await firstValueFrom(ApiRx.create(options({ provider: ws })));
    const oraclePrice = getOraclePrice(apiRx);
    const FEUR = apiRx.createType('CurrencyId', 'FEUR');
    oraclePrice(FEUR).subscribe((output) => {
      console.log(output);
      expect(output).toBeTruthy();
      done();
    });
  }, 60_000);
});
