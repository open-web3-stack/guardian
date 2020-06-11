import Joi from '@hapi/joi';
import { TokenInfo } from '@laminar/api';
import { fromPrecision } from '@laminar/types/utils/precision';
import { switchMap, take } from 'rxjs/operators';
import EthereumTask from './EthereumTask';
import { convertToNewHeader } from './helpers';
import BN from 'big.js';

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
            const oracleValues = await api.currencies.oracleValues().pipe(take(1)).toPromise();

            const oracleValue = oracleValues.find((o) => o.tokenId.toLowerCase() === tokenId.toLowerCase());

            const price = Number(fromPrecision(oracleValue.value));

            if (!oracleValue) throw Error(`Missing the oracleValue of ${tokenName}`);

            const [owner, { collaterals, minted }, liquidationCollateralRatio] = await Promise.all([
              poolInterface.methods.owner().call() as Promise<string>,
              tokenContract.methods.liquidityPoolPositions(poolId).call() as Promise<{
                collaterals: string;
                minted: string;
              }>,
              tokenContract.methods.liquidationCollateralRatio().call() as Promise<string>,
            ]);

            const collateralRatio = +new BN(collaterals).div(new BN(minted).mul(new BN(price)));

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
      })
    );
  }
}
