import { WsProvider } from '@polkadot/rpc-provider';
import { options } from '@acala-network/api';
import { ApiManager } from '@open-web3/api';

export default async (nodeEndpoint: string | string[]) => {
  const ws = new WsProvider(nodeEndpoint);
  const apiManager = await ApiManager.create(options({ provider: ws }));

  return { apiManager };
};
