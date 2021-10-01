import Joi from 'joi';
import { LaminarApi } from '@laminar/api';
import { options } from '@laminar/api/laminar/options';
import { StorageType } from '@laminar/types';
import { WsProvider } from '@polkadot/rpc-provider';
import { createStorage } from '@open-web3/api-mobx';
import { ApiPromise, ApiRx } from '@polkadot/api';
import { LaminarGuardianConfig } from '../types';
import { laminarNetwork } from '../constants';
import { customTypes } from '../customTypes';
import PositionsByTraderTask from '../tasks/laminarChain/PositionsByTraderTask';
import TraderInfoTask from '../tasks/laminarChain/TraderInfoTask';
import BaseSubstrateGuardian from './BaseSubstrateGuardian';
import BalancesTask from '../tasks/orml/BalancesTask';
import PricesTask from '../tasks/orml/PricesTask';
import LiquidityPoolTask from '../tasks/laminarChain/LiquidityPoolTask';
import PoolInfoTask from '../tasks/laminarChain/PoolInfoTask';

const defaultNodeEndpoint = ({ network }: { network: LaminarGuardianConfig['network'] }) => {
  // TODO: update node endpoints
  switch (network) {
    case 'dev':
      return 'ws://localhost:9944';
    case 'turbulence':
      return 'ws://localhost:9944';
    case 'reynolds':
      return 'ws://localhost:9944';
    case 'mainnet':
      return 'ws://localhost:9944';
  }
};

export default class LaminarGuardian extends BaseSubstrateGuardian<
  LaminarGuardianConfig,
  { apiRx: ApiRx; laminarApi: LaminarApi; storage: StorageType }
> {
  tasks() {
    return {
      ...super.tasks(),
      'margin.positionsByTraders': PositionsByTraderTask,
      'margin.traderInfo': TraderInfoTask,
      'margin.poolInfo': PoolInfoTask,
      'account.balances': BalancesTask,
      'oracle.prices': PricesTask,
      'synthetic.liquidityPool': LiquidityPoolTask
    };
  }

  async setup(config: LaminarGuardianConfig) {
    const { network, networkType } = config;
    this._metadata = { ...this._metadata, network, networkType };

    const ws = new WsProvider(config.nodeEndpoint);

    const laminarApi = new LaminarApi({ provider: ws, types: customTypes });
    await laminarApi.isReady();

    const apiOptions = options({ provider: ws, types: customTypes });
    const apiPromise = await ApiPromise.create(apiOptions);
    const storage = createStorage<StorageType>(apiPromise, ws);

    return { apiRx: laminarApi.api, laminarApi, storage };
  }

  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('laminarChain').required(),
      network: Joi.valid(...laminarNetwork).required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).default(defaultNodeEndpoint)
    }).required();
  }
}
