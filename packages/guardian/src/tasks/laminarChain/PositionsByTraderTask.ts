import Joi from 'joi';
import _ from 'lodash';
import { LaminarGuardian } from '@open-web3/guardian/guardians';
import { autorun$ } from '../../utils';
import { Position } from '../../types';
import unrealizedPL from './unrealizedPL';
import accumulatedSwap from './accumulatedSwap';
import Task from '../Task';

export default class PositionsByTraderTask extends Task<{ account: string | string[] }, Position> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required()
    }).required();
  }

  async start(guardian: LaminarGuardian) {
    const { laminarApi, storage } = await guardian.isReady();

    const accounts = _.castArray(this.arguments.account);

    const getSwap = accumulatedSwap(storage);
    const getUnrealizedPL = unrealizedPL(laminarApi, storage);

    return autorun$<Position>((subscriber) => {
      for (const account of accounts) {
        const positionsByTrader = storage.marginProtocol.positionsByTrader.entries(account);
        if (!positionsByTrader) continue;

        const positionIds = [...positionsByTrader.keys()]
          .map((i) => JSON.parse(i))
          .map(([, positionId]) => positionId as number);

        for (const positionId of positionIds) {
          const wrappedPosition = storage.marginProtocol.positions(positionId);
          if (!wrappedPosition) continue;

          const position = wrappedPosition.unwrap();

          const swap = getSwap(position);
          const profit = getUnrealizedPL(position);

          if (!swap || !profit) continue;

          subscriber.next({
            account: position.owner.toString(),
            liquidityPoolId: position.poolId.toString(),
            positionId: positionId.toString(),
            pair: {
              base: position.pair.base.toString(),
              quote: position.pair.quote.toString()
            },
            leverage: position.leverage.toString(),
            marginHeld: position.marginHeld.toString(),
            accumulatedSwap: swap ? swap.toFixed(0) : '',
            profit: profit ? profit.toFixed(0) : ''
          });
        }
      }
    });
  }
}
