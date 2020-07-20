import Joi from '@hapi/joi';
import { fromPrecision } from '@laminar/types/utils/precision';
import { switchMap } from 'rxjs/operators';
import { convertToNewHeader } from './helpers';
import Task from '../Task';
import { EthereumGuardian } from '../../guardians';

export type Output = {
  equity: string;
  leveragedDebits: string;
  marginLevel: number;
  isSafe: boolean;
  isMarginCalled: boolean;
  isLiquidated: boolean;
};

export default class MarginAccountTask extends Task<{ poolId: string; address: string }, Output> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.string()).required(),
      address: Joi.alt(Joi.string()).required(),
    }).required();
  }

  async start(guardian: EthereumGuardian) {
    const { ethereumApi } = await guardian.isReady();

    const { poolId, address } = this.arguments;

    const newHeader$ = convertToNewHeader(ethereumApi);

    return newHeader$.pipe(
      switchMap(async () => {
        const marginFlowProtocolSafety = ethereumApi.baseContracts.marginFlowProtocolSafety;
        const marginFlowProtocol = ethereumApi.baseContracts.marginFlowProtocol;

        const [equity, leveragedDebits, [marginLevel], isSafe, isMarginCalled] = await Promise.all([
          marginFlowProtocol.methods.getEquityOfTrader(poolId, address).call() as Promise<string>,
          marginFlowProtocolSafety.methods.getLeveragedDebitsOfTrader(poolId, address).call() as Promise<string>,
          marginFlowProtocolSafety.methods.getMarginLevel(poolId, address).call() as Promise<[string]>,
          marginFlowProtocolSafety.methods.isTraderSafe(poolId, address).call() as Promise<boolean>,
          marginFlowProtocol.methods.traderIsMarginCalled(poolId, address).call() as Promise<boolean>,
        ]);

        return {
          equity,
          leveragedDebits,
          marginLevel: Number(fromPrecision(marginLevel)),
          isSafe,
          isMarginCalled,
          isLiquidated: !isSafe,
        };
      })
    );
  }
}
