# SurplusAuctionsTask

The `SurplusAuctionsTask` can be used to monitor surplus auctions. It's identifier is `honzon.surplusAuctions`.

## Arguments

There are no arguments for this task.

## Output

The output for this task will be in the following format:

```typescript
{
  "auctionId": number;
  "amount": string;
  "startTime": number;
  "endTime": number | null;
  "lastBidder": string | null;
  "lastBid": string | null;
}
```