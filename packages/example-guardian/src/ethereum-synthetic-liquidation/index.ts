// import { setupApi } from './setupApi';
import registerAction from '../registerAction';
import { EthereumSyntheticPool } from '@open-web3/guardian/types';

const run = () => {
  const liquidate$ = registerAction<EthereumSyntheticPool>('liquidate');

  // const { liquidate } = setupApi();

  liquidate$.subscribe(({ data: pool }) => {});

  // start guardian
  require('@open-web3/guardian-cli');
};

export default run;

// if called directly
if (require.main === module) {
  run();
}
