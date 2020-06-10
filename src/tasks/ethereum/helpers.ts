import Web3 from 'web3';
import { Observable } from 'rxjs';
import { EthereumApi } from '@laminar/api';

export const convertToNewHeader = (api: EthereumApi) => {
  return new Observable((subscriber) => {
    const subscription = api.web3.eth.subscribe('newBlockHeaders', (error, result) => {
      if (error) {
        subscriber.error(error);
      }
      subscriber.next(result);
    });

    return () => {
      subscription.unsubscribe();
    };
  });
};
