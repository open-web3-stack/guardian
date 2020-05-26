import _ from 'lodash';
import Joi from '@hapi/joi';
import { switchMap, flatMap, filter } from 'rxjs/operators';
import SubstrateTask from './SubstrateTask';

type Output = { name: string; args: any[] };

export default class EventsTask extends SubstrateTask<Output> {
  validationSchema() {
    return Joi.object({
      name: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  init(params: { name: string | string[] }) {
    const { name } = params;

    return this.api$.pipe(
      switchMap((api) => {
        return api.query.system.events().pipe(
          flatMap((records) => {
            return records.map(({ event }) => {
              const { section, method, data } = event;
              const name = `${section}.${method}`;
              return { name, args: data };
            });
          }),
          filter((event) => {
            if (_.isArray(name)) {
              return name.includes(event.name);
            }
            return event.name === name;
          })
        );
      })
    );
  }
}
