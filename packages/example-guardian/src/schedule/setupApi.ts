import { options } from '@acala-network/api';
import { ApiManager } from '@open-web3/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { config } from './config';

export const setupApi = async () => {
  await cryptoWaitReady();

  const { nodeEndpoint, address } = config();

  const ws = new WsProvider(nodeEndpoint);
  const apiManager = await ApiManager.create(options({ provider: ws }));

  const getBalance = () => {
    return apiManager.api.query.system.account(address);
  };

  return { getBalance };
};
