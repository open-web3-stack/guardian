import _ from 'lodash';
import joi from '@hapi/joi';
import { Observable } from 'rxjs';
import { switchMap, flatMap, filter } from 'rxjs/operators';
import { LaminarApi } from '@laminar/api';
import Task from '../Task';

type Output = { name: string; args: any[] };

export default class EventsTask extends Task {
  api$: Observable<LaminarApi['api']>;

  validationSchema = joi
    .object({
      name: joi.alt(joi.string(), joi.array().items(joi.string())),
    })
    .required();

  constructor(api$: Observable<LaminarApi['api']>) {
    super();
    this.api$ = api$;
  }

  call(params: { name: string | string[] }): Observable<Output> {
    const { name } = this.validateParameters(params);

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
