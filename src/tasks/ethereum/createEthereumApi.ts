import { EthereumApi } from '@laminar/api';
import { AsyncSubject, Observable } from 'rxjs';
import Web3 from 'web3';

const createEthereumApi = (nodeURL: string): Observable<EthereumApi> => {
  const chainApi$ = new AsyncSubject<EthereumApi>();
  const ethereumApi = new EthereumApi({ provider: new Web3.providers.WebsocketProvider(nodeURL) });

  chainApi$.next(ethereumApi);
  chainApi$.complete();

  return chainApi$;
};

export default createEthereumApi;
