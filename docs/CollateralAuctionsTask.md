# CollateralAuctionsTask

The `CollateralAuctionsTask` can be used to monitor collateral auctions by account and currency ID. It's identifier is `honzon.collateralAuctions`.

## Arguments

`CollateralAuctionsTask` takes two arguments:

1) `account: string | string[]`

    The account address or a list of account addresses of refund recipients of the collateral auctions to monitor. The value `all` may be passed to this argument to montor auctions of all refund recipients.

2) `currencyId: 'all' | CurrencyId | CurrencyId[]`

    The currency or a list of currencies of the collateral auction to monitor. The value `all` may be passed to this argument to monitor auctions of all currencies.

For example:

```yaml
...
task: honzon.collateralAuctions
arguments: 
    account: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQ
    currencyId:
        Token: XBTC
...
```

## Output

The output for this task will be in the following format:

```typescript
{
  "account": string;
  "currencyId": string;
  "auctionId": number;
  "initialAmount": string;
  "amount": string;
  "target": string;
  "startTime": number;
  "endTime": number | null;
  "lastBidder": string | null;
  "lastBid": string | null;
}
```