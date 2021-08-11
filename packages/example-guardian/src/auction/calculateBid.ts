import { CollateralAuction } from '@open-web3/guardian/types';
import { FixedPointNumber } from '@acala-network/sdk-core';

export const calculateBid = async (
  auction: CollateralAuction,
  price: string,
  margin: number,
  stablecoinPrecision: number,
  collateralPrecision: number
): Promise<string> => {
  const amount = FixedPointNumber.fromInner(auction.initialAmount, collateralPrecision);
  // price per unit we're willing to pay
  // unit_price = (1 - margin) * market_price
  const unitPrice = FixedPointNumber.fromInner(price).times(new FixedPointNumber(1 - margin))
  // bid = unit_price * auction_amount
  const bid = unitPrice.times(amount);
  bid.setPrecision(stablecoinPrecision);

  // make sure our bid is greater than current bid
  if (auction.lastBid && FixedPointNumber.fromInner(auction.lastBid, stablecoinPrecision).gte(bid)) {
    throw Error('Last bid is greater or equal to our bid');
  }

  return bid._getInner().toFixed(0);
};
