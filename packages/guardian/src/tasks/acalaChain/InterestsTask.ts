import Joi from 'joi';
import { createAccountCurrencyIdPairs } from '../helpers';
import { Interest } from '../../types';
import Task from '../Task';
import { AcalaGuardian } from '../../guardians';
import { autorun$ } from '../../utils';

export default class InterestsTask extends Task<
  { account: string | string[]; currencyId: string | string[] },
  Interest
> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx, storage } = await guardian.isReady();

    const { account } = this.arguments;
    let { currencyId } = this.arguments;

    const enabledCurrencyIds = apiRx.consts.dex.enabledCurrencyIds.toJSON() as string[];

    // validate currency id
    if (currencyId === 'all') {
      currencyId = enabledCurrencyIds;
    } else if (typeof currencyId === 'string') {
      currencyId = [currencyId];
    }

    currencyId.forEach((currencyId) => {
      if (!enabledCurrencyIds.includes(currencyId)) throw Error(`${currencyId} is not enabled currencyId`);
    });

    // create {account, currencyId} paris
    const pairs = createAccountCurrencyIdPairs(account, currencyId);

    return autorun$<Interest>((subscriber) => {
      for (const { currencyId, account } of pairs) {
        // const interests = storage.dex.withdrawnInterest(currencyId as any, account);
        // if (!interests) continue;
        // subscriber.next({
        //   account,
        //   currencyId,
        //   interests: interests.toString(),
        // });
      }
    });
  }
}
