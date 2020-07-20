import Joi from '@hapi/joi';
import { TokenInfo } from '@laminar/api';
import { fromPrecision } from '@laminar/types/utils/precision';
import { switchMap } from 'rxjs/operators';
import { convertToNewHeader } from './helpers';
import Task from '../Task';
import { EthereumGuardian } from '../../guardians';

export type Output = {
  owner: string;
  collaterals: string;
  minted: string;
  collateralRatio: number;
  isSafe: boolean;
};

export default class SyntheticPoolsTask extends Task<{ poolId: string; tokenName: TokenInfo['name'] }, Output> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.string()).required(),
      tokenName: Joi.alt(Joi.string()).required(),
    }).required();
  }

  async start(guardian: EthereumGuardian) {
    const { ethereumApi } = await guardian.isReady();

    const { poolId, tokenName } = this.arguments;

    const tokenId = ethereumApi.tokenIds[tokenName.toUpperCase()];

    if (!tokenId) throw Error('unexpected tokenName');

    const newHeader$ = convertToNewHeader(ethereumApi);

    return newHeader$.pipe(
      switchMap(async () => {
        const poolInterface = ethereumApi.getSyntheticPoolInterfaceContract(poolId);
        const tokenContract = ethereumApi.getSyntheticFlowTokenContract(tokenId);

        const [
          owner,
          { collaterals, minted },
          liquidationCollateralRatio,
          _additionalCollateralRatio,
          defaultCollateralRatio,
        ] = await Promise.all([
          poolInterface.methods.owner().call() as Promise<string>,
          tokenContract.methods.liquidityPoolPositions(poolId).call() as Promise<{
            collaterals: string;
            minted: string;
          }>,
          tokenContract.methods.liquidationCollateralRatio().call() as Promise<string>,
          poolInterface.methods.getAdditionalCollateralRatio(tokenId).call() as Promise<string>,
          tokenContract.methods.defaultCollateralRatio().call() as Promise<string>,
        ]);

        const additionalCollateralRatio = Number(fromPrecision(_additionalCollateralRatio));
        const minCollateralRatio = Number(fromPrecision(defaultCollateralRatio));
        const collateralRatio =
          1 + (additionalCollateralRatio >= minCollateralRatio ? additionalCollateralRatio : minCollateralRatio);
        const isSafe = 1 + Number(fromPrecision(liquidationCollateralRatio)) > collateralRatio;

        return {
          owner,
          collaterals,
          minted,
          collateralRatio,
          isSafe,
        };
      })
    );
  }
}
