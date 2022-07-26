import { BaseSubstrateGuardianConfig } from '@open-web3/guardian/src/types';
import { acalaNetwork } from '../constants';

export interface AcalaGuardianConfig extends BaseSubstrateGuardianConfig {
  network: typeof acalaNetwork[number];
}

export type CollateralAuction = {
  account: string;
  currencyId: string;
  auctionId: number;
  initialAmount: string;
  amount: string;
  target: string;
  startTime: number;
  endTime?: number;
  lastBidder?: string;
  lastBid?: string;
};

export type Pool = {
  currencyId: string;
  price: string;
  baseLiquidity: string;
  otherLiquidity: string;
};

export type Loan = {
  account: string;
  currencyId: string;
  debits: string;
  debitsUSD: string;
  collaterals: string;
  collateralRatio: string;
};
