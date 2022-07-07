import { BaseSubstrateGuardianConfig } from '@open-web3/guardian';
import { laminarNetwork } from '../constants';

export interface LaminarGuardianConfig extends BaseSubstrateGuardianConfig {
  network: typeof laminarNetwork[number];
}

export type LiquidityPool = {
  poolId: string;
  currencyId: string;
  owner: string;
  liquidity: string;
  bidSpread?: string;
  askSpread?: string;
  additionalCollateralRatio?: string;
  enabled: boolean;
  syntheticIssuance: string;
  collateralBalance: string;
  collateralRatio: string;
  isSafe: boolean;
};

export type Position = {
  account: string;
  liquidityPoolId: string;
  positionId: string;
  pair: {
    base: string;
    quote: string;
  };
  leverage: string;
  marginHeld: string;
  accumulatedSwap: string;
  profit: string;
};
