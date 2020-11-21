import Joi from 'joi';
import { options } from '@acala-network/api';
import { AcalaGuardianConfig } from '../types';
import { acalaNetwork } from '../constants';
import BaseSubstrateGuardian from './BaseSubstrateGuardian';
import { ApiRx, WsProvider, ApiPromise } from '@polkadot/api';
import { customTypes } from '../customTypes';
import BalancesTask from '../tasks/orml/BalancesTask';
import PricesTask from '../tasks/orml/PricesTask';
import LoansTask from '../tasks/acalaChain/LoansTask';
import CollateralAuctionsTask from '../tasks/acalaChain/CollateralAuctionsTask';
import DebitAuctionsTask from '../tasks/acalaChain/DebitAuctionsTask';
import SurplusAuctionsTask from '../tasks/acalaChain/SurplusAuctionsTask';
import PoolsTask from '../tasks/acalaChain/PoolsTask';
import { StorageType } from '@acala-network/types';
import { createStorage } from '@open-web3/api-mobx';

const defaultNodeEndpoint = ({ network }: { network: AcalaGuardianConfig['network'] }) => {
  // TODO: update node endpoints
  switch (network) {
    case 'dev':
      return 'ws://localhost:9944';
    case 'mandala':
      return 'wss://node-6684611762228215808.jm.onfinality.io/ws';
    case 'mainnet':
      return 'ws://localhost:9944';
  }
};

export default class AcalaGuardian extends BaseSubstrateGuardian<
  AcalaGuardianConfig,
  { apiRx: ApiRx; storage: StorageType }
> {
  tasks() {
    return {
      ...super.tasks(),
      'account.balances': BalancesTask,
      'oracle.prices': PricesTask,
      'honzon.loans': LoansTask,
      'honzon.collateralAuctions': CollateralAuctionsTask,
      'honzon.debitAuctions': DebitAuctionsTask,
      'honzon.surplusAuctions': SurplusAuctionsTask,
      'dex.pools': PoolsTask,
    };
  }

  async setup(config: AcalaGuardianConfig) {
    const ws = new WsProvider(config.nodeEndpoint);
    const apiOptions = options({ provider: ws, types: customTypes });

    const apiRx = await ApiRx.create(apiOptions).toPromise();
    const apiPromise = await ApiPromise.create(apiOptions);

    const storage = createStorage<StorageType>(apiPromise, ws);

    return { apiRx, storage };
  }

  validationSchema() {
    return Joi.object({
      networkType: Joi.valid('acalaChain').required(),
      network: Joi.valid(...acalaNetwork).required(),
      nodeEndpoint: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).default(defaultNodeEndpoint),
    }).required();
  }
}
