import Joi from '@hapi/joi';
import { fromPrecision } from '@laminar/types/utils/precision';
import { from } from 'rxjs';
import { switchMap, flatMap } from 'rxjs/operators';
import { convertToNewHeader } from './helpers';
import Task from '../Task';
import { EthereumGuardian } from '../../guardians';
import { EthereumSyntheticPool } from '../../types';

const validTokens = ['FEUR', 'FJPY', 'FCAD', 'FCHF', 'FGBP', 'FAUD', 'FOIL', 'FXAU', 'FBTC', 'FETH'];

export default class SyntheticPoolsTask extends Task<
  { poolId: string; tokenName: string | string[] | 'all' },
  EthereumSyntheticPool
> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.string().required(),
      tokenName: Joi.alt(
        Joi.string().valid(...validTokens, 'all'),
        Joi.array()
          .min(1)
          .items(Joi.string().valid(...validTokens))
      ).required(),
    }).required();
  }

  async start(guardian: EthereumGuardian) {
    const { ethereumApi } = await guardian.isReady();

    const { poolId, tokenName } = this.arguments;

    let tokenIds: string[];
    if (tokenName === 'all') {
      tokenIds = validTokens.map((i) => ethereumApi.tokenIds[i]);
    } else if (Array.isArray(tokenName)) {
      tokenIds = tokenName.map((i) => ethereumApi.tokenIds[i]);
    } else {
      tokenIds = [ethereumApi.tokenIds[tokenName]];
    }

    const newHeader$ = convertToNewHeader(ethereumApi);

    return from(tokenIds).pipe(
      flatMap((tokenId) =>
        newHeader$.pipe(
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
              poolId,
              tokenId,
              owner,
              collaterals,
              minted,
              collateralRatio,
              isSafe,
            };
          })
        )
      )
    );
  }
}
