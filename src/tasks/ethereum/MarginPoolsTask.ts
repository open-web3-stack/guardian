import Joi from '@hapi/joi';
import { fromPrecision } from '@laminar/types/utils/precision';
import { switchMap } from 'rxjs/operators';
import EthereumTask from './EthereumTask';
import { convertToNewHeader } from './helpers';

export type Output = {
  owner: string;
  enp: number;
  ell: number;
  equity: string;
  isSafe: boolean;
  isMarginCalled: boolean;
  isLiquidated: boolean;
};

export default class MarginPoolsTask extends EthereumTask<Output> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.string()).required(),
    }).required();
  }

  init(params: { poolId: string }) {
    const { poolId } = params;

    return this.api$.pipe(
      switchMap((api) => {
        const newHeader$ = convertToNewHeader(api);

        return newHeader$.pipe(
          switchMap(async () => {
            const poolInterface = api.getMarginPoolInterfaceContract(poolId);
            const marginLiquidityPoolRegistry = api.baseContracts.marginLiquidityPoolRegistry;
            const marginFlowProtocolSafety = api.baseContracts.marginFlowProtocolSafety;

            const [owner, [[enp], [ell]], equity, isSafe, isMarginCalled] = await Promise.all([
              poolInterface.methods.owner().call() as Promise<string>,
              marginFlowProtocolSafety.methods.getEnpAndEll(poolId).call() as Promise<[[string], [string]]>,
              marginFlowProtocolSafety.methods.getEquityOfPool(poolId).call() as Promise<string>,
              marginFlowProtocolSafety.methods.isPoolSafe(poolId).call() as Promise<boolean>,
              marginLiquidityPoolRegistry.methods.isMarginCalled(poolId).call() as Promise<boolean>,
            ]);

            return {
              owner,
              enp: Number(fromPrecision(enp)),
              ell: Number(fromPrecision(ell)),
              equity,
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
