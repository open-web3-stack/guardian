# DebitAuctionsTask

The `DebitAuctionsTask` can be used to monitor debit auctions. It's identifier is `honzon.debitAuctions`.

## Arguments

TODO

## Output

The output for this task will be in the following format:

```typescript
{
  "auctionId": number;
  "initialAmount": string;
  "amount": string;
  "fix: string";
  "startTime": number;
  "endTime": number | null;
  "lastBidder": string | null;
  "lastBid": string | null;
}
```
