import Big, { BigSource } from 'big.js';
import { CollateralAuction } from '@open-web3/guardian/types';
import { toBaseUnit as dollar } from '@open-web3/util';

export const calculateBid = async (
  auction: CollateralAuction,
  price: BigSource,
  margin: number,
  collateralPrecision: number
): Promise<Big> => {
  // price per unit we're willing to pay
  // unit_price = (1 - margin) * market_price
  const unitPrice = dollar(1).sub(dollar(margin)).mul(price).div(dollar(1));

  // bid = unit_price * auction_amount
  const bid = unitPrice.mul(auction.amount).div(
    Big(
      (10 ** (collateralPrecision + 18 - 12)) /* AUSD precision */
        .toString()
    )
  );

  // make sure our bid is greater than current bid
  if (auction.lastBid && Big(auction.lastBid).gte(bid)) {
    throw Error('Last bid is greater or equal to our bid');
  }

  return bid;
};
