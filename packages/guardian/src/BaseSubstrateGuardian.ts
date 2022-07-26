import { ApiRx } from '@polkadot/api';
import Guardian from './Guardian';
import { BaseSubstrateGuardianConfig, TaskConstructor } from './types';
import { AccountsTask, StorageTask, EventsTask, ScheduleTimeTask, ScheduleBlockNumberTask } from './tasks';

export default abstract class BaseSubstrateGuardian<
  C extends BaseSubstrateGuardianConfig = BaseSubstrateGuardianConfig,
  P extends { apiRx: ApiRx } = { apiRx: ApiRx }
> extends Guardian<C, P> {
  tasks(): Record<string, TaskConstructor> {
    return {
      'schedule.time': ScheduleTimeTask,
      'schedule.blockNumber': ScheduleBlockNumberTask,
      'system.events': EventsTask,
      'system.storage': StorageTask,
      'system.accounts': AccountsTask
    } as any as Record<string, TaskConstructor>;
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
