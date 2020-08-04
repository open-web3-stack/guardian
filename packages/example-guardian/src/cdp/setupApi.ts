import Big from 'big.js';
import { WsProvider } from '@polkadot/rpc-provider';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { options } from '@acala-network/api';
import { ApiManager } from '@open-web3/api';
import { Loan } from '@open-web3/guardian/types';
import { readConst } from './const';

export const setupApi = async () => {
  await cryptoWaitReady();

  const { nodeEndpoint, SURI, address } = readConst();

  const ws = new WsProvider(nodeEndpoint);
  const apiManager = await ApiManager.create(options({ provider: ws }));

  // setup keyring
  const keyring = new Keyring({ type: 'sr25519' });
  keyring.addFromUri(SURI);

  const keyringPair = keyring.getPair(address);

  // adjust loan by +10% collateral
  const adjustLoan = (loan: Loan) => {
    const { currencyId, collaterals } = loan;

    const adjusment = Big(collaterals).mul(0.1).toFixed(0); // +10% collateral

    const tx = apiManager.api.tx.honzon.adjustLoan(currencyId as any, adjusment, 0);

    return apiManager.signAndSend(tx, { account: keyringPair }).finalized;
  };

  return { adjustLoan };
};
