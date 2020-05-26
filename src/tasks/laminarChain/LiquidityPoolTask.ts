import _ from 'lodash';
import Joi from '@hapi/joi';
import { from } from 'rxjs';
import { switchMap, flatMap } from 'rxjs/operators';
import { SyntheticPoolInfo } from '@laminar/api';
import LaminarTask from './LaminarTask';

export default class LiquidityPoolTask extends LaminarTask<SyntheticPoolInfo> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.number(), Joi.array().min(1).items(Joi.number()), Joi.valid('all')),
      currencyId: Joi.any(),
    }).required();
  }

  // TODO: implement desired output
  init(params: { poolId: number | number[] | 'all'; currencyId: any }) {
    const { poolId } = params;

    return this.chainApi$.pipe(
      switchMap((laminarApi) => {
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
