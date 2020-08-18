import Big, { BigSource } from 'big.js';
import { DebitAuction, CollateralAuction, SurplusAuction } from '@open-web3/guardian/types';
import { dollar } from '../utils';

export const calculateBid = (
  auction: CollateralAuction | DebitAuction | SurplusAuction,
  price: BigSource,
  balance: BigSource,
  margin: BigSource
): Big => {
  // price per unit we're willing to pay
  // unit_price = (1 - margin) * market_price
  const unitPrice = dollar(1).sub(dollar(margin)).mul(price).div(dollar(1));

  // bid = unit_price * auction_amount
  const bid = unitPrice.mul(auction.amount).div(dollar(1));

  // make sure our bid is greater than current bid
  if (auction.lastBid && Big(auction.lastBid).gte(bid)) {
    throw Error('Last bid is greater or equal to our bid');
  }

  // simple check for enough balance
  if (Big(balance).lt(bid)) {
    throw Error('Not enough balance to place the bid');
  }

  return bid;
};
