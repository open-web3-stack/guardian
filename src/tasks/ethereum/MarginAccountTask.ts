import Joi from '@hapi/joi';
import { fromPrecision } from '@laminar/types/utils/precision';
import { switchMap } from 'rxjs/operators';
import EthereumTask from './EthereumTask';
import { convertToNewHeader } from './helpers';

export type Output = {
  equity: string;
  leveragedDebits: string;
  marginLevel: number;
  isSafe: boolean;
  isMarginCalled: boolean;
  isLiquidated: boolean;
};

export default class MarginAccountTask extends EthereumTask<Output> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.string()).required(),
      address: Joi.alt(Joi.string()).required(),
    }).required();
  }

  init(params: { poolId: string; address: string }) {
    const { poolId, address } = params;

    return this.api$.pipe(
      switchMap((api) => {
        const newHeader$ = convertToNewHeader(api);

        return newHeader$.pipe(
          switchMap(async () => {
            const marginFlowProtocolSafety = api.baseContracts.marginFlowProtocolSafety;
            const marginFlowProtocol = api.baseContracts.marginFlowProtocol;

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
      })
    );
  }
}
