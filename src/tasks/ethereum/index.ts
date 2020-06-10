import { EthereumApi } from '@laminar/api';
import { Observable } from '@polkadot/types/types';
import MarginAccountTask from './MarginAccountTask';
import MarginPoolsTask from './MarginPoolsTask';
import SyntheticPoolsTask from './SyntheticPoolsTask';

// eslint-disable-next-line
export default (api$: Observable<EthereumApi>) => {
  return {
    synthetic: {
      pools: new SyntheticPoolsTask(api$),
    },
    margin: {
      pools: new MarginPoolsTask(api$),
      account: new MarginAccountTask(api$),
    },
  };
};
