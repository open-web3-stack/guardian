import { Observable } from 'rxjs';
import { ApiRx } from '@polkadot/api';

import EventsTask from './EventsTask';
import StorageTask from './StorageTask';
import AccountsTask from './AccountsTask';

export default (api$: Observable<ApiRx>) => ({
  system: {
    events: new EventsTask(api$),
    storage: new StorageTask(api$),
    accounts: new AccountsTask(api$),
  },
});
