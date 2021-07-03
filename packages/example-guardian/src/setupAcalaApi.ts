import { WsProvider } from '@polkadot/rpc-provider';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { options } from '@acala-network/api';
import { ApiManager } from '@open-web3/api';

export default async (nodeEndpoint: string, SURI: string, address: string) => {
  await cryptoWaitReady();

  const ws = new WsProvider(nodeEndpoint);
  const apiManager = await ApiManager.create(options({ provider: ws }));

  // setup keyring
  const keyring = new Keyring({ type: 'sr25519' });
  keyring.addFromUri(SURI);

  const keyringPair = keyring.getPair(address);

  return { apiManager, keyring, keyringPair };
};
