import _ from 'lodash';
import joi from '@hapi/joi';
import { Observable, from } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { SyntheticPoolInfo } from '@laminar/api';
import { laminarApi$ } from '../laminarApi';
import Task from '../../Task';

export default class LiquidityPoolTask extends Task {
  validationSchema = joi
    .object({
      poolId: joi.alt(joi.number(), joi.array().items(joi.number()), joi.valid('all')),
      currencyId: joi.any(),
    })
    .required();

  // TODO: implement desired output
  call(params: { poolId: number | number[] | 'all'; currencyId: any }): Observable<SyntheticPoolInfo> {
    const { poolId } = this.validateParameters(params);

    return laminarApi$.pipe(
      flatMap((laminarApi) => {
        if (poolId === 'all') {
          return laminarApi.synthetic.allPoolIds().pipe(
            flatMap((ids: string[]) => ids.map((id) => laminarApi.synthetic.poolInfo(id))),
            flatMap((results) => results)
          );
        } else if (_.isArray(poolId)) {
          return from(poolId).pipe(flatMap((id) => laminarApi.synthetic.poolInfo(`${id}`)));
        }
        return laminarApi.synthetic.poolInfo(`${poolId}`);
      })
    );
  }
}
