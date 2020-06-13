export type Balance = {
  account: string;
  currencyId: string;
  free: string;
  reserved: string;
  frozen: string;
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

export type Event = { name: string; args: any[] };
