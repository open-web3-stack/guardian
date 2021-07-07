import { ActionRegistry } from '@open-web3/guardian';
import { config } from './config';
import setupAcalaApi from '../setupAcalaApi';
import { setDefaultConfig, logger } from '../utils';

export default async () => {
  setDefaultConfig('schedule.yml');

  const { nodeEndpoint, address } = config();
  const { apiManager } = await setupAcalaApi(nodeEndpoint);

  const getBalance = () => {
    return apiManager.api.query.system.account(address);
  };

  ActionRegistry.register('getBalance', () => {
    getBalance().then((balance) => {
      logger.log('balance: ', balance.toHuman());
    });
  });

  // start guardian
  require('@open-web3/guardian-cli');
};
