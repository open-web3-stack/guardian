import { LaminarApi, options } from '@laminar/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { AsyncSubject, Observable } from 'rxjs';
import { customTypes } from '../../customTypes';

const createLaminarApi = (nodeURL: string | string[]): Observable<LaminarApi> => {
  const chainApi$ = new AsyncSubject<LaminarApi>();
  const laminarApi = new LaminarApi(options({ provider: new WsProvider(nodeURL), types: customTypes }) as any);
  laminarApi.isReady().then(() => {
    chainApi$.next(laminarApi);
    chainApi$.complete();
  });
  return chainApi$;
};

export default createLaminarApi;
