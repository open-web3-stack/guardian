import Joi from 'joi';
import { filter, map } from 'rxjs/operators';
import BaseSubstrateGuardian from '../../guardians/BaseSubstrateGuardian';
import Task from '../Task';

export interface Output {
  current: number;
  next: number;
}

export default class ScheduleBlockNumberTask extends Task<
  { startNumber?: number; step: number; finalized: boolean },
  Output
> {
  validationSchema() {
    return Joi.object({
      startNumber: Joi.number().optional(),
      step: Joi.number().default(1).optional(),
      finalized: Joi.boolean().default(false).optional(),
    }).required();
  }

  async start(guardian: BaseSubstrateGuardian) {
    const { apiRx } = await guardian.isReady();
    const { startNumber, step, finalized } = this.arguments;

    const newHeads = finalized ? apiRx.rpc.chain.subscribeFinalizedHeads : apiRx.rpc.chain.subscribeNewHeads;

    let firstNumber: number;

    return newHeads().pipe(
      map((header) => header.number.toNumber()),
      filter((number) => {
        if (!firstNumber) {
          if (startNumber) {
            firstNumber = startNumber;
          } else {
            firstNumber = number;
          }
        }

        const delta = number - firstNumber;

        if (delta < 0) {
          return false;
        }

        return !(delta % step);
      }),
      map((number) => {
        return {
          current: number,
          next: number + step,
        };
      })
    );
  }
}
