import Joi from 'joi';
import { options } from '@acala-network/api';
import { firstValueFrom } from 'rxjs';
import { AcalaGuardianConfig } from '../types';
import { acalaNetwork } from '../constants';
import BaseSubstrateGuardian from './BaseSubstrateGuardian';
import { ApiRx, WsProvider, ApiPromise } from '@polkadot/api';
import { customTypes } from '../customTypes';
import BalancesTask from '../tasks/orml/BalancesTask';
import PricesTask from '../tasks/orml/PricesTask';
import LoansTask from '../tasks/acalaChain/LoansTask';
import CollateralAuctionsTask from '../tasks/acalaChain/CollateralAuctionsTask';
import PoolsTask from '../tasks/acalaChain/PoolsTask';
import { StorageType } from '@acala-network/types';
import { createStorage } from '@open-web3/api-mobx';

const defaultNodeEndpoint = ({ network }: { network: AcalaGuardianConfig['network'] }) => {
  // TODO: update node endpoints
  switch (network) {
    case 'dev':
      return 'ws://localhost:9944';
    case 'mandala':
      return 'wss://testnet-node-1.acala.laminar.one/ws';
    case 'mainnet':
      return 'ws://localhost:9944';
  }
};

export default class AcalaGuardian extends BaseSubstrateGuardian<
  AcalaGuardianConfig,
  { apiRx: ApiRx; storage: StorageType; getTokenPrecision: (token: string) => number | undefined }
> {
  private readonly tokenDecimals: Record<string, number> = {};

  tasks() {
    return {
      ...super.tasks(),
      'account.balances': BalancesTask,
      'oracle.prices': PricesTask,
      'honzon.loans': LoansTask,
      'honzon.collateralAuctions': CollateralAuctionsTask,
      'dex.pools': PoolsTask
    };
  }

  async setup(config: AcalaGuardianConfig) {
    const ws = new WsProvider(config.nodeEndpoint);
    const apiOptions = options({ provider: ws, types: customTypes });

    const apiRx = await firstValueFrom(ApiRx.create(apiOptions));
    const apiPromise = await ApiPromise.create(apiOptions);

    const storage = createStorage<StorageType>(apiPromise, ws);

    // fetch token precision
    const properties = await apiPromise.rpc.system.properties();
    const tokenSymbol = properties.tokenSymbol.unwrapOrDefault();
    const tokenDecimals = properties.tokenDecimals.unwrapOrDefault();
    if (tokenSymbol.length !== tokenDecimals.length) {
      throw Error(`Token symbols/decimals mismatch ${tokenSymbol} ${tokenDecimals}`);
    }
    tokenSymbol.forEach((symbol, index) => {
      this.tokenDecimals[symbol.toString()] = tokenDecimals[index].toNumber();
    });

    const getTokenPrecision = (token: string): number | undefined => {
      return this.tokenDecimals[token.toUpperCase()];
    };

    return { apiRx, storage, getTokenPrecision };
  }

  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('acalaChain').required(),
      network: Joi.valid(...acalaNetwork).required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).default(defaultNodeEndpoint)
    }).required();
  }
}
