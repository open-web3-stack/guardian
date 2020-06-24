export type Balance = {
  account: string;
  currencyId: string;
  free: string;
  // reserved: string;
  // frozen: string;
};

export type Price = {
  key: string;
  value: string;
};

export type CollateralAuction = {
  account: string;
  currencyId: string;
  auctionId: number;
  amount: string;
  target: string;
  startTime: number;
  endTime: number | null;
  lastBidder: string | null;
  lastBid: string | null;
};

export type DebitAuction = {
  auctionId: number;
  amount: string;
  fix: string;
  startTime: number;
  endTime: number | null;
  lastBidder: string | null;
  lastBid: string | null;
};

export type SurplusAuction = {
  auctionId: number;
  amount: string;
  startTime: number;
  endTime: number | null;
  lastBidder: string | null;
  lastBid: string | null;
};

export type Event = {
  name: string;
  args: any;
};

export type Pool = {
  currencyId: string;
  price: string;
  baseLiquidity: string;
  otherLiquidity: string;
};

export type Interest = {
  account: string;
  currencyId: string;
  interests: string;
};

export type LiquidityPool = {
  poolId: string;
  currencyId: string;
  owner: string;
  liquidity: string;
  bidSpread: string | null;
  askSpread: string | null;
  additionalCollateralRatio: number | null;
  enabled: boolean;
  syntheticIssuance: number | null;
  collateralBalance: number | null;
  collateralRatio: number | null;
  isSafe: boolean | null;
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
