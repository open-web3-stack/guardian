import Web3 from 'web3';
import { EthereumApi } from '@laminar/api';
import readConst from './const';
import setupMonitoring from './setupMonitoring';

const run = () => {
  const { nodeEndpoint } = readConst();
  const ethereumApi = new EthereumApi({ provider: new Web3.providers.WebsocketProvider(nodeEndpoint) });

  const { laminarLiquidate$, ethereumLiquidate$ } = setupMonitoring();

  laminarLiquidate$.subscribe((data) => {
    console.log(data);
  });

  ethereumLiquidate$.subscribe((data) => {
    console.log(data);
    // ethereumApi.baseContracts.syntheticFlowProtocol.methods.liquidate(data.tokenId, data.poolId, data.minted).signAndSend();
  });

  // start guardian
  require('@open-web3/guardian-cli');
};

export default run;

// if called directly
if (require.main === module) {
  run();
}
