# PoolsTask

The `PoolsTask` can be used to monitor one or more liquidity pools for changes. It's identifier is `dex.pools`.

## Arguments

`PoolsTask` takes one argument `currencyId: any` that represents the token in a liquidity pool with `aUSD`. It can either be a single token or a list of token's you would like to monitor. The value `all` cal also be passed to `currencyId` to monitor all of the liquidity pools.

for example:

```yaml
...
task: dex.pools
arguments:
    currencyId:
        - DOT
        - ACA
...
```

## Output

The output for this task will be in the following format:

```typescript
{
  "currencyId": string, // A two element array with representing the liquidityc pool of the input token and aUSD
  "price": string,
  "baseLiquidity": string,
  "otherLiquidity": string
}
}
```