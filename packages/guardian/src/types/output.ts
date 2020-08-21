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
  initialAmount: string;
  amount: string;
  target: string;
  startTime: number;
  endTime: number | null;
  lastBidder: string | null;
  lastBid: string | null;
};

export type DebitAuction = {
  auctionId: number;
  initialAmount: string;
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
  args: Record<string, any>;
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
  additionalCollateralRatio: string | null;
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

export type EthereumSyntheticPool = {
  poolId: string;
  tokenId: string;
  owner: string;
  collaterals: string;
  minted: string;
  collateralRatio: number;
  isSafe: boolean;
};

export type Loan = {
  account: string;
  currencyId: string;
  debits: string;
  debitsUSD: string;
  collaterals: string;
  collateralRatio: string;
};
