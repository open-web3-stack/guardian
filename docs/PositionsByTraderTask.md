# PositionsByTraderTask

The `PositionsByTraderTask` can be used to monitor one or more accounts's positions. It's identifier is `margin.positionsByTrader`.

## Arguments

`PositionsByTraderTask` takes the argument `account` of type `string` or `string[]` for monitoring multiple accounts, for example:

```yaml
...
task: margin.positionsByTrader
arguments: 
    account: 
        - 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQ
        - 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
...
```

## Output

The output for this task will be in the following format:

```typescript
{
  "account": string;
  "liquidityPoolId": string;
  "positionId": string;
  "pair": {
    "base": string;
    "quote": string;
  };
  "leverage": string;
  "marginHeld": string;
  "accumulatedSwap": string;
  "profit": string;
}
```