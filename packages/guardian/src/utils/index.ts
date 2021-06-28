import { defaultLogger } from '@open-web3/util';

export * from './autorun$';
export * from './sleep';

export const logger = defaultLogger.createLogger('@open-web3/guardian');

export const tokenPrecision = (currencyId: any): number => {
  switch (currencyId.toUpperCase()) {
    case 'ACA':
    case 'AUSD':
      return 12;
    case 'DOT':
    case 'LDOT':
      return 10;
    case 'RENBTC':
      return 8;
    case 'KAR':
    case 'KUSD':
    case 'KSM':
    case 'LKSM':
      return 12;
    default:
      return 18;
  }
};
