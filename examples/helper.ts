import { config as dotenv } from 'dotenv';
import Big from 'big.js';
import { options } from '@acala-network/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { Keyring } from '@polkadot/keyring';
import { ApiManager } from '@open-web3/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { toBaseUnit } from '@open-web3/util';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { xxhashAsHex } from '@polkadot/util-crypto';

dotenv();

export const config = {
  ws: process.env.WS_URL || 'ws://localhost::9944',
  suri: process.env.SURI || '//Alice',
};

export const createApi = async () => {
  const ws = new WsProvider(config.ws);
  const apiManager = await ApiManager.create(options({ provider: ws }));

  return {
    apiManager,
    api: apiManager.api,
  };
};

export const dollar = (x: BalanceType) => toBaseUnit(x).toFixed();

export type BalanceType = Big | number | string;

function getModulePrefix(module: string): string {
  return xxhashAsHex(module, 128);
}

export const setup = async () => {
  const keyring = new Keyring({ type: 'sr25519' });
  const apiManager = await ApiManager.create({ ...options(), wsEndpoint: config.ws, account: config.suri, keyring });
  const api = apiManager.api;
  const account = apiManager.defaultAccount!;

  return {
    apiManager,
    api,
    keyring,
    account,
    tx: api.tx,
    async teardown() {
      this.api.disconnect();
      await new Promise((resolve) => setTimeout(resolve, 2000)); // give some time to cleanup
    },
    async makeAccounts(count: number, bal: BalanceType = toBaseUnit(1)) {
      const random = Math.random().toString(16).substr(2, 6);
      const accounts = new Array(count).fill(null).map((_, i) => this.account.derive(`//${random}//${i}`));
      if (bal > 0) {
        await this.updateBalance(accounts, api.consts.currencies.nativeCurrencyId.toString(), bal).inBlock;
      }
      console.log(
        'Accounts: ',
        accounts.map((a) => a.address)
      );
      return accounts;
    },
    updateBalance(acc: string | KeyringPair | Array<string | KeyringPair>, currency: string, val: BalanceType) {
      const accounts = ([] as Array<string | KeyringPair>)
        .concat(acc)
        .map((x) => (typeof x === 'string' ? x : x.address));

      return this.apiManager.signAndSend(
        accounts.map((a) =>
          this.api.tx.sudo.sudo(this.api.tx.currencies.updateBalance(a, currency, new Big(val).toFixed()))
        )
      );
    },
    feedPrice(currency: string, price: BalanceType) {
      const values = [[currency, new Big(price).toFixed()]];
      return this.sudo(this.api.tx.oracle.feedValues(values, 0, new Uint8Array()));
    },
    send(call: SubmittableExtrinsic<'promise'>, account?: KeyringPair) {
      return this.apiManager.signAndSend(call, { account });
    },
    sudo(call: SubmittableExtrinsic<'promise'>) {
      return this.send(this.api.tx.sudo.sudo(call));
    },
    killModuleStorage(module: string) {
      return this.sudo(this.tx.system.killPrefix(getModulePrefix(module), 0));
    },
    async killAll() {
      await this.killModuleStorage('Tokens').send;
      await this.killModuleStorage('CDPEngine').send;
      await this.killModuleStorage('Loans').send;
      await this.killModuleStorage('AuctionManager').send;
      await this.killModuleStorage('Auction').send;
      await this.killModuleStorage('CDPTreasury').send;
      await this.killModuleStorage('Dex').inBlock;
    },
  };
};

type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown;
}
  ? U
  : T;

export type Context = Await<ReturnType<typeof setup>>;
