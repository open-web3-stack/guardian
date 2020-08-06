import { WsProvider } from '@polkadot/rpc-provider';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { options } from '@acala-network/api';
import { Fixed18 } from '@acala-network/app-util';
import { ApiManager } from '@open-web3/api';

export default async (nodeEndpoint: string, bidderSURI: string, bidderAddress: string) => {
  await cryptoWaitReady();

  const ws = new WsProvider(nodeEndpoint);
  const apiManager = await ApiManager.create(options({ provider: ws }));

  // setup keyring
  const keyring = new Keyring({ type: 'sr25519' });
  keyring.addFromUri(bidderSURI);

  const keyringPair = keyring.getPair(bidderAddress);

  const exchangeFee = Fixed18.fromParts(apiManager.api.consts.dex.getExchangeFee.toString());
  const slippage = Fixed18.fromRational(5, 1000); // 0.5% price slippage

  const bid = async (auctionId: number, bid: string) => {
    const tx = apiManager.api.tx.auction.bid(auctionId, bid);
    return apiManager.signAndSend(tx, { account: keyringPair }).finalized;
  };

  const swap = async (
    supplyCurrencyId: string,
    supplyAmount: string,
    targetCurrencyId: string,
    targetAmount: string
  ) => {
    const tx = apiManager.api.tx.dex.swapCurrency(
      supplyCurrencyId as any,
      supplyAmount,
      targetCurrencyId as any,
      targetAmount
    );
    return apiManager.signAndSend(tx, { account: keyringPair }).finalized;
  };

  return { exchangeFee, slippage, bid, swap };
};
