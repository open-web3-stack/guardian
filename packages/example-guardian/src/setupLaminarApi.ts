import { WsProvider } from '@polkadot/rpc-provider';
import { options } from '@laminar/api/laminar/options';
import { ApiManager } from '@open-web3/api';

export const setupLaminarApi = async (nodeEndpoint: string | string[]) => {
  const ws = new WsProvider(nodeEndpoint);
  const apiManager = await ApiManager.create(
    options({
      provider: ws,
      types: {
        AccountInfo: 'AccountInfoWithRefCount'
      }
    }) as any
  );

  return { apiManager };
};
