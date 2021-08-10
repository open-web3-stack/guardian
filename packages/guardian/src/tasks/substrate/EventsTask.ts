import Joi from 'joi';
import { firstValueFrom } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';
import BaseSubstrateGuardian from '../../guardians/BaseSubstrateGuardian';
import Task from '../Task';
import { Event } from '../../types';
import { getEventParams } from '../helpers';

export default class EventsTask extends Task<{ name: string | string[] }, Event> {
  validationSchema() {
    return Joi.object({
      name: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required()
    }).required();
  }

  async start(guardian: BaseSubstrateGuardian) {
    const { apiRx } = await guardian.isReady();

    const { name } = this.arguments;

    return apiRx.rpc.chain.getBlock().pipe(
      mergeMap(({ block }) => Promise.all([block, firstValueFrom(apiRx.query.system.events.at(block.header.hash))])),
      mergeMap(([block, records]) => {
        return records.map(({ phase, event }) => {
          const params = getEventParams(event);
          const { index, section, method, data } = event;
          const name = `${section}.${method}`;
          const args = {};
          data.forEach((value, index) => {
            const key = params[index] || index.toString();
            args[key] = value.toJSON();
          });
          return {
            blockNumber: block.header.number.toNumber(),
            blockHash: block.header.hash.toHex(),
            phase: phase.toJSON(),
            index: index.toHex(),
            name,
            args
          };
        });
      }),
      filter((event) => {
        if (Array.isArray(name)) {
          return name.includes(event.name);
        }
        return event.name === name;
      })
    );
  }
}
