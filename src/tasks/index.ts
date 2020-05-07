import { ApiRx } from '@polkadot/api';
import { LaminarApi, EthereumApi } from '@laminar/api';
import { Observable } from '@polkadot/types/types';

import ethereum from './ethereum';
import laminarChain from './laminarChain';
import acalaChain from './acalaChain';

export const createEthereumTasks = (api$: Observable<EthereumApi>) => ({
  ...ethereum(api$),
});

export const createLaminarTasks = (api$: Observable<LaminarApi>) => ({
  ...laminarChain(api$),
});

export const createAcalaTasks = (api$: Observable<ApiRx>) => ({
  ...acalaChain(api$),
});
