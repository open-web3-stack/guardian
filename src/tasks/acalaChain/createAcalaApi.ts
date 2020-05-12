import { ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { AsyncSubject, Observable } from 'rxjs';
import { options } from '@acala-network/api';

const createAcalaApi = (nodeURL: string | string[]): Observable<ApiRx> => {
  const chainApi$ = new AsyncSubject<ApiRx>();
  const api = new ApiRx(options({ provider: new WsProvider(nodeURL) }));
  api.isReady.subscribe((api) => {
    chainApi$.next(api);
    chainApi$.complete();
  });
  return chainApi$;
};

export default createAcalaApi;
