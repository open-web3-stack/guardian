import { CronJob } from 'cron';
import Joi from 'joi';
import { Observable } from 'rxjs';
import Task from '../Task';
import BaseSubstrateGuardian from '../../guardians/BaseSubstrateGuardian';

export interface Output {
  current: number;
  next: number;
}

export default class ScheduleTimeTask extends Task<{ cronTime: string }, Output> {
  validationSchema() {
    return Joi.object({
      cronTime: Joi.string().required()
    }).required();
  }

  async start<T extends BaseSubstrateGuardian>(guardian: T) {
    await guardian.isReady();

    const { cronTime } = this.arguments;

    return new Observable<Output>((subscriber) => {
      const job = new CronJob(
        cronTime,
        () => {
          subscriber.next({
            current: +new Date(),
            next: +job.nextDate()
          });
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
