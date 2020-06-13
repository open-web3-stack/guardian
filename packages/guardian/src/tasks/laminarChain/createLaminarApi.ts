import { LaminarApi } from '@laminar/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { AsyncSubject, Observable } from 'rxjs';

const createLaminarApi = (nodeURL: string | string[]): Observable<LaminarApi> => {
  const chainApi$ = new AsyncSubject<LaminarApi>();
  const laminarApi = new LaminarApi({ provider: new WsProvider(nodeURL) });
  laminarApi.isReady().then(() => {
    chainApi$.next(laminarApi);
    chainApi$.complete();
  });
  return chainApi$;
};

export default createLaminarApi;
