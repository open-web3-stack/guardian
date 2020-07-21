import { ReplaySubject } from 'rxjs';
import { EthereumSyntheticPool } from '@open-web3/guardian/types';
import registerAction from '../registerAction';

const setupMonitoring = () => {
  const laminarLiquidate$ = new ReplaySubject<any>();
  const ethereumLiquidate$ = new ReplaySubject<EthereumSyntheticPool>();

  registerAction('laminarLiquidate', laminarLiquidate$);
  registerAction('ethereumLiquidate', ethereumLiquidate$);

  return {
    laminarLiquidate$,
    ethereumLiquidate$,
  };
};

export default setupMonitoring;
