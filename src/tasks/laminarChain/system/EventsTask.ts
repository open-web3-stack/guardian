import _ from 'lodash';
import joi from '@hapi/joi';
import { Observable } from 'rxjs';
import { flatMap, filter } from 'rxjs/operators';
import { laminarApi$ } from '../laminarApi';
import Task from '../../Task';

type Result = { name: string; args: any[] };

export default class EventsTask extends Task {
  validationSchema = joi
    .object({
      name: joi.alt(joi.string(), joi.array().items(joi.string())),
    })
    .required();

  call(params: { name: string | string[] }): Observable<Result> {
    const { name } = this.validateParameters(params);

    return laminarApi$.pipe(
      flatMap((laminarApi) => {
        return laminarApi.api.query.system.events().pipe(
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
