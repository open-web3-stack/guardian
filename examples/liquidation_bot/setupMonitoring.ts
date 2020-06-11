import { ReplaySubject } from 'rxjs';
import SyntheticPoolsTask, { Output as EthereumSyntheticPool } from '../../src/tasks/ethereum/SyntheticPoolsTask';
import registerAction from './registerAction';

const setupMonitoring = () => {
  const laminarLiquidate$ = new ReplaySubject<any>();
  const ethereumLiquidate$ = new ReplaySubject<{
    data: EthereumSyntheticPool;
    task: SyntheticPoolsTask;
    args: {
      maxCollateralRatio: number;
    };
  }>();

  registerAction('laminarLiquidate', laminarLiquidate$);
  registerAction('ethereumLiquidate', ethereumLiquidate$);

  return {
    laminarLiquidate$,
    ethereumLiquidate$,
  };
};

export default setupMonitoring;
