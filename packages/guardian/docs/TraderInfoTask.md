# TraderInfoTask

The `TraderInfoTask` can be used to monitor one or more accounts by liquidity pool on a set interval. It's identifier is `margin.traderInfo`.

## Arguments

`TraderInfoTask` takes three arguments:

1) `account: string | string[]`

    The account address, or a list of account addresses to monitor.

2) `poolId: number | number[] | "all"`

    The pool ID or a list of pool IDs to monitor by each account given. The value `all` may also be passed into this argument to monitor all of the pools for each account.

3) `period: number`

    The interval in milliseconds between retrieving information on the given account(s).

For example:

```yaml
...
task: margin.traderInfo
arguments:
    account: 5EHyc8XcDAaTJQN8TRd6xc5SVqQ8zg3q7svDeQ6TvzHvYsDv
    poolId: all
    period: 5000
...
```

## Output

The output for this task will be in the following format:

```typescript
{
  "equity": string;
  "balance": string;
  "freeMargin": string;
  "marginHeld": string;
  "unrealizedPl": string;
  "totalLeveragedPosition": string;
  "accumulatedSwap": string;
  "marginLevel": string;
}
```