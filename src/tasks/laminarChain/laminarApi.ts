import { LaminarApi, WsProvider } from '@laminar/api';
import { AsyncSubject } from 'rxjs';

export const laminarApi$ = new AsyncSubject<LaminarApi>();

export const getLaminarApi = (): Promise<LaminarApi> => {
  return laminarApi$.toPromise();
};

export const createLaminarApi = async (nodeURL: string) => {
  const api = new LaminarApi({ provider: new WsProvider(nodeURL) });
  await api.isReady();
  laminarApi$.next(api);
  laminarApi$.complete();
};
