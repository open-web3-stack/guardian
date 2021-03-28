# PoolInfoTask

The `PoolInfoTask` can be used to monitor monitor liquidity pools and retrieve information on them in a set interval. It's identifier is `margin.poolInfo`

## Arguments

`PoolInfoTask` takes two arguments:

1) `poolId: number | number[]`

    The pool ID or a list of pool IDs to monitor. The value `all` may also be used to monitor all pools.

2) `period: number`

    The interval in milliseconds between retrieving information on the given liquidity pool(s).

For example:

```yaml
...
task: margin.poolInfo
arguments: 
    poolId: 2
    period: 1000
...
```

## Output

The output for this task will be in the following format:

```typescript
{
  "poolId": string;
  "owner": string;
  "balance": string;
  "ell": string;
  "enp": string;
  "options": TraderPairOptions[];
  "minLeveragedAmount": string;
  "astBid": string | null;
}
```