import Joi from '@hapi/joi';
import { fromPrecision } from '@laminar/types/utils/precision';
import { switchMap } from 'rxjs/operators';
import { EthereumGuardian } from '../../guardians';
import { convertToNewHeader } from './helpers';
import Task from '../Task';

export type Output = {
  owner: string;
  enp: number;
  ell: number;
  equity: string;
  isSafe: boolean;
  isMarginCalled: boolean;
  isLiquidated: boolean;
};

export default class MarginPoolsTask extends Task<{ poolId: string }, Output> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.string()).required(),
    }).required();
  }

  async start(guardian: EthereumGuardian) {
    const { ethereumApi } = await guardian.isReady();

    const { poolId } = this.arguments;

    const newHeader$ = convertToNewHeader(ethereumApi);

    return newHeader$.pipe(
      switchMap(async () => {
        const poolInterface = ethereumApi.getMarginPoolInterfaceContract(poolId);
        const marginLiquidityPoolRegistry = ethereumApi.baseContracts.marginLiquidityPoolRegistry;
        const marginFlowProtocolSafety = ethereumApi.baseContracts.marginFlowProtocolSafety;

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
  }
}
