import Web3 from 'web3';
import { EthereumApi } from '@laminar/api';
import readConst from './const';
import setupMonitoring from './setupMonitoring';

const run = async () => {
  const { nodeEndpoint } = readConst();
  const ethereumApi = new EthereumApi({ provider: new Web3.providers.WebsocketProvider(nodeEndpoint) });

  const { laminarLiquidate$, ethereumLiquidate$ } = setupMonitoring();

  laminarLiquidate$.subscribe((data) => {
    console.log(data);
  });

  ethereumLiquidate$.subscribe(async (result) => {
    ethereumApi.baseContracts.syntheticFlowProtocol.methods.liquidate().signAndSend();
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
