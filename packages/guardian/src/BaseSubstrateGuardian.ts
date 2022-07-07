import { ApiRx } from '@polkadot/api';
import Guardian from './Guardian';
import { BaseSubstrateGuardianConfig } from './types';
import AccountsTask from './tasks/substrate/AccountsTask';
import StorageTask from './tasks/substrate/StorageTask';
import EventsTask from './tasks/substrate/EventsTask';
import ScheduleTimeTask from './tasks/substrate/ScheduleTimeTask';
import ScheduleBlockNumberTask from './tasks/substrate/ScheduleBlockNumberTask';

export default abstract class BaseSubstrateGuardian<
  C extends BaseSubstrateGuardianConfig = BaseSubstrateGuardianConfig,
  P extends { apiRx: ApiRx } = { apiRx: ApiRx }
> extends Guardian<C, P> {
  tasks() {
    return {
      'schedule.time': ScheduleTimeTask,
      'schedule.blockNumber': ScheduleBlockNumberTask,
      'system.events': EventsTask,
      'system.storage': StorageTask,
      'system.accounts': AccountsTask
    };
  }

  async teardown() {
    if (!this.isSetup) return;
    this.stop();
    const { apiRx } = await this.isReady();
    if (apiRx.isConnected) {
      await apiRx.disconnect();
    }
  }
}
