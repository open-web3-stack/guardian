import Joi from '@hapi/joi';
import { combineLatest } from 'rxjs';
import { map, flatMap, filter } from 'rxjs/operators';
import { Option } from '@polkadot/types/codec';
import { AuctionInfo, AccountId, Balance } from '@open-web3/orml-types/interfaces';
import { CollateralAuctionItem } from '@acala-network/types/interfaces';
import { getAuctionsIds, unwrapOptionalCodec } from './helpers';
import { CollateralAuction } from '../../types';
import { AcalaGuardian } from '../../guardians';
import Task from '../Task';

export default class CollateralAuctionsTask extends Task<
  { account: string | string[]; currencyId: string | string[] },
  CollateralAuction
> {
  validationSchema() {
    return Joi.object({
      account: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
      currencyId: Joi.alt(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
    }).required();
  }

  async start(guardian: AcalaGuardian) {
    const { apiRx } = await guardian.isReady();

    const { account, currencyId } = this.arguments;

    const fulfillAccount = CollateralAuctionsTask.fulfillArguments(account);
    const fulfillCurrencyId = CollateralAuctionsTask.fulfillArguments(currencyId);

    return getAuctionsIds(apiRx).pipe(
      flatMap((auctionId) =>
        combineLatest([
          unwrapOptionalCodec(apiRx.query.auction.auctions<Option<AuctionInfo>>(auctionId)),
          unwrapOptionalCodec(apiRx.query.auctionManager.collateralAuctions<Option<CollateralAuctionItem>>(auctionId)),
        ]).pipe(
          filter(([, collateralAuction]) => {
            const account = collateralAuction.owner.toString();
            const currencyId = collateralAuction.currencyId.toString();
            return fulfillAccount(account) && fulfillCurrencyId(currencyId);
          }),
          map(([auction, collateralAuction]) => {
            let lastBidder: AccountId | null = null;
            let lastBid: Balance | null = null;
            if (auction.bid.isSome) {
              [lastBidder, lastBid] = auction.bid.unwrap();
            }

            return {
              account: collateralAuction.owner.toString(),
              currencyId: collateralAuction.currencyId.toString(),
              auctionId,
              amount: collateralAuction.amount.toString(),
              target: collateralAuction.target.toString(),
              startTime: Number.parseInt(collateralAuction.startTime.toString()),
              endTime: auction.end.isSome ? Number.parseInt(auction.end.toString()) : null,
              lastBidder: lastBidder ? lastBidder.toString() : null,
              lastBid: lastBid ? lastBid.toString() : null,
            };
          })
        )
      )
    );
  }

  static fulfillArguments = (source: string | string[]) => (input: string): boolean => {
    if (source === 'all') {
      return true;
    } else if (typeof source === 'string') {
      return source === input;
    } else {
      return source.includes(input);
    }
  };
}
