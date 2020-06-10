import Joi from '@hapi/joi';
import { TokenInfo } from '@laminar/api';
import { fromPrecision } from '@laminar/types/utils/precision';
import { switchMap } from 'rxjs/operators';
import EthereumTask from './EthereumTask';
import { convertToNewHeader } from './helpers';

export type Output = {
  owner: string;
  collaterals: string;
  minted: string;
  collateralRatio: number;
  isSafe: boolean;
};

export default class SyntheticPoolsTask extends EthereumTask<Output> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.string()).required(),
      tokenName: Joi.alt(Joi.string()).required(),
    }).required();
  }

  init(params: { poolId: string; tokenName: TokenInfo['name'] }) {
    const { poolId, tokenName } = params;

    return this.api$.pipe(
      switchMap((api) => {
        const tokenId = api.tokenIds[tokenName.toUpperCase()];

        if (!tokenId) throw Error('unexpected tokenName');

        const newHeader$ = convertToNewHeader(api);

        return newHeader$.pipe(
          switchMap(async () => {
            const poolInterface = api.getSyntheticPoolInterfaceContract(poolId);
            const tokenContract = api.getSyntheticFlowTokenContract(tokenId);

            const [
              owner,
              { collaterals, minted },
              liquidationCollateralRatio,
              additionalCollateralRatio,
            ] = await Promise.all([
              poolInterface.methods.owner().call() as Promise<string>,
              tokenContract.methods.liquidityPoolPositions(poolId).call() as Promise<{
                collaterals: string;
                minted: string;
              }>,
              tokenContract.methods.liquidationCollateralRatio().call() as Promise<string>,
              poolInterface.methods.getAdditionalCollateralRatio(tokenId).call() as Promise<string>,
            ]);

            const collateralRatio = 1 + Number(fromPrecision(additionalCollateralRatio));
            const isSafe = collateralRatio > Number(fromPrecision(liquidationCollateralRatio));

            return {
              owner,
              collaterals,
              minted,
              collateralRatio,
              isSafe,
            };
          })
        );
      })
    );
  }
}
