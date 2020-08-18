import Joi from 'joi';
import { Observable } from 'rxjs';
import { autorun } from 'mobx';
import { LaminarGuardian } from '@open-web3/guardian/guardians';
import { Position } from '../../types';
import unrealizedPL from './unrealizedPL';
import accumulatedSwap from './accumulatedSwap';
import Task from '../Task';

export default class PositionsByTraderTask extends Task<{ account: string | string[] }, Position> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  async start(guardian: LaminarGuardian) {
    const { laminarApi, storage } = await guardian.isReady();

    const { account } = this.arguments;
    const accounts = Array.isArray(account) ? account : [account];

    return new Observable<Position>((subscriber) => {
      const dispose = autorun(() => {
        const positions: Position[] = [];

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

            const swap = accumulatedSwap(storage)(position);
            const profit = unrealizedPL(laminarApi, storage)(position);

            positions.push({
              account: position.owner.toString(),
              liquidityPoolId: position.poolId.toString(),
              positionId: positionId.toString(),
              pair: {
                base: position.pair.base.toString(),
                quote: position.pair.quote.toString(),
              },
              leverage: position.leverage.toString(),
              marginHeld: position.marginHeld.toString(),
              accumulatedSwap: swap ? swap.toFixed(0) : '',
              profit: profit ? profit.toFixed(0) : '',
            });
          }
        }

        positions.forEach((position) => {
          subscriber.next(position);
        });
      });

      return () => dispose();
    });
  }
}
