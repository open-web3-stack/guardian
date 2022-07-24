import * as Joi from 'joi';
import { firstValueFrom } from 'rxjs';
import { options } from '@laminar/api';
import { ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { LaminarGuardianConfig } from './types';
import { laminarNetwork } from './constants';
import { customTypes } from './customTypes';
import PositionsByTraderTask from './tasks/PositionsByTraderTask';
import TraderInfoTask from './tasks/TraderInfoTask';
import { BaseSubstrateGuardian, BalancesTask, PricesTask, TaskConstructor } from '@open-web3/guardian';
import LiquidityPoolTask from './tasks/LiquidityPoolTask';
import PoolInfoTask from './tasks/PoolInfoTask';

const defaultNodeEndpoint = ({ network }: { network: LaminarGuardianConfig['network'] }) => {
  // TODO: update node endpoints
  switch (network) {
    case 'dev':
      return 'ws://localhost:9944';
    case 'turbulence':
      return 'wss://testnet-node-1.laminar-chain.laminar.one/ws';
    case 'reynolds':
      return 'ws://localhost:9944';
    case 'mainnet':
      return 'ws://localhost:9944';
  }
};

export default class LaminarGuardian extends BaseSubstrateGuardian<
  LaminarGuardianConfig,
  { apiRx: ApiRx; tokens: Record<string, number> }
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
    } as any as Record<string, TaskConstructor>;
  }

  async setup(config: LaminarGuardianConfig) {
    const { network } = config;
    this._metadata = { ...this._metadata, network };

    const ws = new WsProvider(config.nodeEndpoint);

    const apiRx = await firstValueFrom(ApiRx.create(options({ provider: ws, types: customTypes as any }) as any));

    // fetch token precision
    const properties = await firstValueFrom(apiRx.rpc.system.properties());
    const tokenSymbol = properties.tokenSymbol.unwrapOrDefault();
    const tokenDecimals = properties.tokenDecimals.unwrapOrDefault();
    if (tokenSymbol.length !== tokenDecimals.length) {
      throw Error(`Token symbols/decimals mismatch ${tokenSymbol} ${tokenDecimals}`);
    }
    tokenSymbol.forEach((symbol, index) => {
      this.tokenDecimals[symbol.toString()] = tokenDecimals[index].toBn().toNumber();
    });

    return { apiRx, tokens: this.tokenDecimals };
  }

  validationSchema() {
    return Joi.object({
      chain: Joi.valid('laminar'),
      network: Joi.valid(...laminarNetwork).required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).default(defaultNodeEndpoint)
    }).required();
  }
}
