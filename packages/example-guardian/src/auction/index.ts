import Big from 'big.js';
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ActionRegistry } from '@open-web3/guardian';
import { CollateralAuction, Event } from '@open-web3/guardian/types';
import { FixedPointNumber } from '@acala-network/sdk-core';
import { OrmlAccountData } from '@open-web3/orml-types/interfaces';
import { tokenPrecision } from '../../../guardian/src/utils';
import config from './config';
import setupAcalaApi from '../setupAcalaApi';
import { setDefaultConfig, logger } from '../utils';
import { calculateBid } from './calculateBid';

export default async () => {
  setDefaultConfig('collateral-auction-guardian.yml');

  const { nodeEndpoint, address, margin, SURI } = config();

  const auction$ = new Subject<CollateralAuction>();
  const auctionDealt$ = new Subject<Event>();

  // register `collateral_auction_created` action to feed `auction$` with data
  ActionRegistry.register('collateral_auction_created', async (_, data: CollateralAuction): Promise<void> => {
    auction$.next(data);
  });

  // register `collateral_auction_dealt` action to feed `auctionDealt$` with data
  ActionRegistry.register('collateral_auction_dealt', async (args: any, data: Event): Promise<void> => {
    auctionDealt$.next(data);
  });

  const { apiManager, keyringPair } = await setupAcalaApi(nodeEndpoint, SURI, address);

  const onAuction = async (auction: CollateralAuction) => {
    // current aUSD balance
    const balance = await apiManager.api.query.tokens.accounts<OrmlAccountData>(address, { token: 'AUSD' });

    // collateral token precision
    const precision = tokenPrecision(auction.currencyId);

    // calculate dex price
    const baseCurrency = apiManager.api.createType('CurrencyId', { token: 'AUSD' });
    const otherCurrency = apiManager.api.createType('CurrencyId', { token: auction.currencyId });
    const [base, other] = await apiManager.api.query.dex.liquidityPool([baseCurrency, otherCurrency] as any);
    const _other = FixedPointNumber.fromInner(other.toString(), precision);
    const _base = FixedPointNumber.fromInner(base.toString(), tokenPrecision('AUSD'));
    const price = _other.div(_base);
    price.setPrecision(18);

    const bid = await calculateBid(auction, price._getInner().toString(), margin, precision);

    // simple check for enough balance
    if (Big(balance.free.toString()).lt(bid)) {
      throw Error('Not enough balance to place the bid');
    }

    const tx = apiManager.api.tx.auction.bid(auction.auctionId, bid.toFixed(0));
    const { blockHash, txHash } = await apiManager.signAndSend(tx, { account: keyringPair }).inBlock;
    logger.log('Bid sent: ', { blockHash: blockHash.toHex(), txHash: txHash.toHex() });
  };

  const onAuctionDealt = async (event: Event) => {
    const currencyId = event.args['collateral_type'] || event.args['arg2'];
    const amount = event.args['collateral_amount'] || event.args['arg3'];

    const tx = apiManager.api.tx.dex.swapWithExactSupply([currencyId, { token: 'AUSD' }], amount, 0);
    const { blockHash, txHash } = await apiManager.signAndSend(tx, { account: keyringPair }).inBlock;
    logger.log('Swap sent: ', { blockHash: blockHash.toHex(), txHash: txHash.toHex() });
  };

  auction$.pipe(concatMap(async (auction) => await onAuction(auction).catch((e) => logger.error(e)))).subscribe();

  auctionDealt$.pipe(concatMap(async (event) => await onAuctionDealt(event).catch((e) => logger.error(e)))).subscribe();

  // start guardian
  require('@open-web3/guardian-cli');
};
