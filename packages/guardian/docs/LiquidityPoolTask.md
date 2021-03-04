# LiquidityPoolTask

The `LiquidityPoolTask` can be used to monitor one or more events on chain. It's identifier is `synthetic.liquidityPool`.

## Arguments

`LiquidityPoolTask` takes the two arguments:

1) `poolId: number | number[] | "all"`

    This is the ID of the pool or pools you want to monitor. Giving this argument the value `all` will monitor all of the existing pools.

2) `currencyId: string | string[]`

    The currency or currencies you want to monitor for each pool.

For example:

```yaml
...
task: synthetic.liquidityPool
arguments: 
    poolId: all
    currencyId:
        - LAMI
        - AUSD
...
```

## Output

The output for this task will be in the following format:

TODO