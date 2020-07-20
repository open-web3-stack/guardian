import { ApiRx } from '@polkadot/api';
import Guardian from './Guardian';
import { BaseSubstrateGuardianConfig } from '../types';
import AccountsTask from '../tasks/substrate/AccountsTask';
import StorageTask from '../tasks/substrate/StorageTask';
import EventsTask from '../tasks/substrate/EventsTask';

export default abstract class BaseSubstrateGuardian<
  C extends BaseSubstrateGuardianConfig = BaseSubstrateGuardianConfig,
  P extends { apiRx: ApiRx } = { apiRx: ApiRx }
> extends Guardian<C, P> {
  tasks() {
    return {
      'system.events': EventsTask,
      'system.storage': StorageTask,
      'system.accounts': AccountsTask,
    };
  }
}
