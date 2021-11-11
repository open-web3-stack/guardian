import Joi from 'joi';
import { firstValueFrom } from 'rxjs';
import { options } from '@laminar/api';
import { ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { LaminarGuardianConfig } from '../types';
import { laminarNetwork } from '../constants';
import { customTypes } from '../customTypes';
import PositionsByTraderTask from '../tasks/laminar/PositionsByTraderTask';
import TraderInfoTask from '../tasks/laminar/TraderInfoTask';
import BaseSubstrateGuardian from './BaseSubstrateGuardian';
import BalancesTask from '../tasks/orml/BalancesTask';
import PricesTask from '../tasks/orml/PricesTask';
import LiquidityPoolTask from '../tasks/laminar/LiquidityPoolTask';
import PoolInfoTask from '../tasks/laminar/PoolInfoTask';

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
  { apiRx: ApiRx; getTokenPrecision: (token: string) => number | undefined; tokens: Record<string, number> }
> {
  private readonly tokenDecimals: Record<string, number> = {};

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
    const apiOptions = options({ provider: ws, types: customTypes });

    const apiRx = await firstValueFrom(ApiRx.create(apiOptions));

    // fetch token precision
    const properties = await firstValueFrom(apiRx.rpc.system.properties());
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

    return { apiRx, getTokenPrecision, tokens: this.tokenDecimals };
  }

  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('laminarChain').required(),
      network: Joi.valid(...laminarNetwork).required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).default(defaultNodeEndpoint)
    }).required();
  }
}
