import Joi from 'joi';
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

    return apiRx.query.system.events().pipe(
      mergeMap((records) => {
        return records.map(({ event }) => {
          const params = getEventParams(event);
          const { section, method, data } = event;
          const name = `${section}.${method}`;
          const args = {};
          data.forEach((value, index) => {
            const key = params[index] || index.toString();
            args[key] = value.toJSON();
          });
          return { name, args };
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
