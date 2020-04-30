import _ from 'lodash';
import joi from '@hapi/joi';
import { Observable } from 'rxjs';
import { flatMap, filter } from 'rxjs/operators';
import Task from '../Task';
import { LaminarApi } from '@laminar/api';

type Result = { name: string; args: any[] };

export default class EventsTask extends Task {
  chainApi$: Observable<LaminarApi /* | AcalaApi*/>;

  validationSchema = joi
    .object({
      name: joi.alt(joi.string(), joi.array().items(joi.string())),
    })
    .required();

  constructor(chainApi$: Observable<LaminarApi /* | AcalaApi*/>) {
    super();
    this.chainApi$ = chainApi$;
  }

  call(params: { name: string | string[] }): Observable<Result> {
    const { name } = this.validateParameters(params);

    return this.chainApi$.pipe(
      flatMap((chainApi) => {
        return chainApi.api.query.system.events().pipe(
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
