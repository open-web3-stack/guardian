import { autorun } from 'mobx';
import { options, WsProvider } from '@laminar/api';
import { ApiPromise } from '@polkadot/api';
import { createStorage } from '@open-web3/api-mobx';
import { StorageType } from '@laminar/types';

it('api-mobx storage works', async (done) => {
  const ws = new WsProvider('wss://testnet-node-1.laminar-chain.laminar.one/ws');
  const apiPromise = await ApiPromise.create(options({ provider: ws }));

  const storage = createStorage<StorageType>(apiPromise, ws);

  autorun(() => {
    const hash = storage.block.hash;
    if (hash) {
      console.log(hash);
      done();
    }
  });
}, 30_000);
