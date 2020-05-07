import { ApiRx } from '@polkadot/api';
import { Observable } from 'rxjs';

import createAcalaApi from './createAcalaApi';

import EventsTask from '../shared/EventsTask';
import StorageTask from '../shared/StorageTask';
import AccountsTask from '../shared/AccountsTask';

export { createAcalaApi };

export default (api$: Observable<ApiRx>) => {
  return {
    system: {
      events: new EventsTask(api$),
      storage: new StorageTask(api$),
      accounts: new AccountsTask(api$),
    },
  };
};
