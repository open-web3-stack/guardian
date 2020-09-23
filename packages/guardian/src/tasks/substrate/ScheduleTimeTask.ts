import { CronJob } from 'cron';
import Joi from 'joi';
import { Observable } from 'rxjs';
import Task from '../Task';
import BaseSubstrateGuardian from '../../guardians/BaseSubstrateGuardian';

export default class ScheduleTimeTask extends Task<{ cronTime: string }, number> {
  validationSchema() {
    return Joi.object({
      cronTime: Joi.string().required(),
    }).required();
  }

  async start(guardian: BaseSubstrateGuardian) {
    await guardian.isReady();

    const { cronTime } = this.arguments;

    return new Observable<number>((subscriber) => {
      const job = new CronJob(
        cronTime,
        () => {
          subscriber.next(+new Date());
        },
        () => {
          subscriber.complete();
        },
        true
      );

      return () => {
        job.stop();
      };
    });
  }
}
