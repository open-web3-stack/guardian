import { WsProvider } from '@polkadot/rpc-provider';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { options } from '@laminar/api/laminar/options';
import { ApiManager } from '@open-web3/api';
import { LiquidityPool } from '@open-web3/guardian/types';
import { u64 } from '@polkadot/types/primitive';
import { readConst } from './const';

export const setupApi = async () => {
  await cryptoWaitReady();

  const { nodeEndpoint, SURI, address } = readConst();

  const ws = new WsProvider(nodeEndpoint);
  const apiManager = await ApiManager.create(options({ provider: ws, types: { TransactionPriority: u64 } }));

  // setup keyring
  const keyring = new Keyring({ type: 'sr25519' });
  keyring.addFromUri(SURI);

  const keyringPair = keyring.getPair(address);

  const liquidate = (pool: LiquidityPool) => {
    const { poolId, currencyId, syntheticIssuance } = pool;
    const tx = apiManager.api.tx.syntheticProtocol.liquidate(poolId, currencyId as any, syntheticIssuance);
    return apiManager.signAndSend(tx, { account: keyringPair }).finalized;
  };

  return { liquidate };
};
