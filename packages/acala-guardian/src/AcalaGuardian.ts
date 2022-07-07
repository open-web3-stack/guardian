import * as Joi from 'joi';
import { options } from '@acala-network/api';
import { firstValueFrom } from 'rxjs';
import { AcalaGuardianConfig } from './types';
import { acalaNetwork } from './constants';
import { ApiRx, WsProvider } from '@polkadot/api';
import { customTypes } from './customTypes';
import { BalancesTask, BaseSubstrateGuardian, PricesTask } from '@open-web3/guardian';
import LoansTask from './tasks/acala/LoansTask';
import CollateralAuctionsTask from './tasks/acala/CollateralAuctionsTask';
import PoolsTask from './tasks/acala/PoolsTask';
import { types } from '@acala-network/types';

const defaultNodeEndpoint = ({ network }: { network: AcalaGuardianConfig['network'] }) => {
  // TODO: keep this up-to-date
  switch (network) {
    case 'dev':
      return 'ws://localhost:9944';
    case 'mandala':
      return ['wss://mandala.polkawallet.io/', 'wss://acala-mandala.api.onfinality.io/public-ws'];
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
      return [
        'wss://acala-rpc-0.aca-api.network/',
        'wss://acala-rpc-1.aca-api.network/',
        'wss://acala-rpc-3.aca-api.network/ws',
        'wss://acala.polkawallet.io/',
        'wss://acala-polkadot.api.onfinality.io/public-ws',
        'wss://acala-rpc.dwellir.com/'
      ];
  }
};

export default class AcalaGuardian extends BaseSubstrateGuardian<AcalaGuardianConfig, { apiRx: ApiRx }> {
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
    const { network } = config;
    this._metadata = { ...this._metadata, network };

    const provider = new WsProvider(config.nodeEndpoint);
    const apiRx = await firstValueFrom(ApiRx.create(options({ provider, types: { ...types, ...customTypes } })));

    return { apiRx };
  }

  validationSchema() {
    return Joi.object({
      chain: Joi.valid('acala'),
      network: Joi.valid(...acalaNetwork).required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).default(defaultNodeEndpoint)
    }).required();
  }
}
