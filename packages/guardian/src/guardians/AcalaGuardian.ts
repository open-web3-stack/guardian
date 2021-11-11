import Joi from 'joi';
import { options } from '@acala-network/api';
import { firstValueFrom } from 'rxjs';
import { AcalaGuardianConfig } from '../types';
import { acalaNetwork } from '../constants';
import BaseSubstrateGuardian from './BaseSubstrateGuardian';
import { ApiRx, WsProvider } from '@polkadot/api';
import { customTypes } from '../customTypes';
import BalancesTask from '../tasks/orml/BalancesTask';
import PricesTask from '../tasks/orml/PricesTask';
import LoansTask from '../tasks/acala/LoansTask';
import CollateralAuctionsTask from '../tasks/acala/CollateralAuctionsTask';
import PoolsTask from '../tasks/acala/PoolsTask';

const defaultNodeEndpoint = ({ network }: { network: AcalaGuardianConfig['network'] }) => {
  // TODO: keep this up-to-date
  switch (network) {
    case 'dev':
      return 'ws://localhost:9944';
    case 'mandala':
      return [
        'wss://testnet-node-1.laminar-chain.laminar.one/ws',
        'wss://node-6787234140909940736.jm.onfinality.io/ws'
      ];
    case 'karura':
      return [
        'wss://karura-rpc-0.aca-api.network',
        'wss://karura-rpc-1.aca-api.network',
        'wss://karura-rpc-2.aca-api.network',
        'wss://karura-rpc-3.aca-api.network',
        'wss://karura.polkawallet.io',
        'wss://karura.api.onfinality.io/public-ws',
        'wss://pub.elara.patract.io/karura'
      ];
    case 'mainnet':
      return [];
  }
};

export default class AcalaGuardian extends BaseSubstrateGuardian<
  AcalaGuardianConfig,
  { apiRx: ApiRx; getTokenPrecision: (token: string) => number | undefined }
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

    return { apiRx, getTokenPrecision };
  }

  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('acalaChain').required(),
      network: Joi.valid(...acalaNetwork).required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).default(defaultNodeEndpoint)
    }).required();
  }
}
