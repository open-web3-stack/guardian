import { defaultLogger } from '@open-web3/util';

export const sleep = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });

export const logger = defaultLogger.createLogger('@open-web3/guardian');
