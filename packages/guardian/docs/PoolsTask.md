# PoolsTask

The `PoolsTask` can be used to monitor one or more liquidity pools for changes. It's identifier is `dex.pools`.

## Arguments

`PoolsTask` takes one argument `currencyId` of type `any` that represents the token in a trading pool with `aUSD`

for example:

```yaml
...
task: account.balances
arguments:
    account: 5HmWP5WF24fchkiTqJPn5q2nrgFf3VD81LfdU7KRJLPve3fj
    currencyId:
        - DOT
        - ACA
...
```

## Output

The output for this task will be in the following format:

```typescript
{
  "currencyId": Token[], // A two element array with representing the trading pool of the input token and aUSD
  "price": number,
  "baseLiquidity": number,
  "otherLiquidity": number
}
}
```