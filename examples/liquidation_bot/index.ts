import guardian from '../../src';
import readConfig from '../../src/read-config';
import setupMonitoring from './setupMonitoring';
import { switchMap } from 'rxjs/operators';

const run = async () => {
  const { laminarLiquidate$, ethereumLiquidate$ } = setupMonitoring();

  laminarLiquidate$.subscribe((data) => {
    console.log(data);
  });

  ethereumLiquidate$.subscribe(async (result) => {
    const { collateralRatio } = result.data;
    const { maxCollateralRatio } = result.args;
    const api$ = result.task.api$;

    if (maxCollateralRatio >= collateralRatio) {
      const api = await api$.toPromise();

      api.baseContracts.syntheticFlowProtocol.methods.liquidate().signAndSend();
    }
  });

  const config = readConfig(`${__dirname}/config.yml`);

  // start guardian
  guardian(config);
};

export default run;

// if called directly
if (require.main === module) {
  run();
}
