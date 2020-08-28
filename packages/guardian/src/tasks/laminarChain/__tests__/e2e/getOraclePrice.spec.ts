import { autorun } from 'mobx';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { createStorage } from '@open-web3/api-mobx';
import { StorageType } from '@laminar/types';
import { options } from '@laminar/api/laminar/options';
import getOraclePrice from '../../../getOraclePrice';

describe('getOraclePrice', () => {
  it('should get the price', async (done) => {
    const ws = new WsProvider('wss://testnet-node-1.laminar-chain.laminar.one/ws');
    const apiPromise = await ApiPromise.create(options({ provider: ws }));
    const storage = createStorage<StorageType>(apiPromise, ws);
    const oraclePrice = getOraclePrice(storage);
    autorun(() => {
      const price = oraclePrice('FEUR');
      if (price) {
        console.log(price);
        done();
      }
    });
  }, 60_000);
});
