import { LiquidityPool } from '@open-web3/guardian/types';
import { setupApi } from './setupApi';
import registerAction from '../registerAction';
import { pausable } from '../pausable';

const run = async () => {
  const liquidate$ = registerAction<LiquidityPool>('liquidate');

  const { liquidate } = await setupApi();

  const { stream$, pause, resume } = pausable(liquidate$);

  stream$.subscribe(({ data: pool }) => {
    if (pool.collateralRatio === '0') return;
    console.log(pool);
    pause();
    liquidate(pool)
      .then(() => {
        resume();
      })
      .catch((error) => {
        console.error(error);
      });
  });

  // start guardian
  require('@open-web3/guardian-cli');
};

export default run;

// if called directly
if (require.main === module) {
  run().catch((error) => {
    console.error(error);
    process.exit(-1);
  });
}
