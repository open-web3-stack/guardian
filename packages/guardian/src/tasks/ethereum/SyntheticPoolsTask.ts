import Joi from 'joi';
import { EthereumApi } from '@laminar/api';
import { fixed18toString } from '@laminar/api/utils/precision';
import { from } from 'rxjs';
import { switchMap, flatMap, concatAll } from 'rxjs/operators';
import { convertToNewHeader } from './helpers';
import Task from '../Task';
import { EthereumGuardian } from '../../guardians';
import { EthereumSyntheticPool } from '../../types';

const validTokens = ['FEUR', 'FJPY', 'FCAD', 'FCHF', 'FGBP', 'FAUD', 'FOIL', 'FXAU', 'FBTC', 'FETH'];

export default class SyntheticPoolsTask extends Task<
  { poolId: string | string[]; tokenName: string | string[] },
  EthereumSyntheticPool
> {
  validationSchema() {
    return Joi.object({
      poolId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      tokenName: Joi.alt(
        Joi.string().valid(...validTokens, 'all'),
        Joi.array()
          .min(1)
          .items(Joi.string().valid(...validTokens))
      ).required()
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

    return this.getPoolIds(ethereumApi, poolId).pipe(
      flatMap((poolId) =>
        from(tokenIds).pipe(
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
                  defaultCollateralRatio
                ] = await Promise.all([
                  poolInterface.methods.owner().call() as Promise<string>,
                  tokenContract.methods.liquidityPoolPositions(poolId).call() as Promise<{
                    collaterals: string;
                    minted: string;
                  }>,
                  tokenContract.methods.liquidationCollateralRatio().call() as Promise<string>,
                  poolInterface.methods.getAdditionalCollateralRatio(tokenId).call() as Promise<string>,
                  tokenContract.methods.defaultCollateralRatio().call() as Promise<string>
                ]);

                const additionalCollateralRatio = Number(fixed18toString(_additionalCollateralRatio));
                const minCollateralRatio = Number(fixed18toString(defaultCollateralRatio));
                const collateralRatio =
                  1 +
                  (additionalCollateralRatio >= minCollateralRatio ? additionalCollateralRatio : minCollateralRatio);
                const isSafe = 1 + Number(fixed18toString(liquidationCollateralRatio)) > collateralRatio;

                return {
                  poolId,
                  tokenId,
                  owner,
                  collaterals,
                  minted,
                  collateralRatio,
                  isSafe
                };
              })
            )
          )
        )
      )
    );
  }

  private getPoolIds(ethereumApi: EthereumApi, poolId: string | string[]) {
    if (poolId === 'all') {
      return ethereumApi.synthetic.allPoolIds().pipe(concatAll());
    }
    return from(Array.isArray(poolId) ? poolId : [poolId]);
  }
}
