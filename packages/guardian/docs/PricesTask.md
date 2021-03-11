# PricesTask

The `PricesTask` can be used to query a chain's oracle for token prices on a fixed interval. It's identifier is `oracle.prices`.

## Arguments

`PricesTask` takes two arguments:

1) `key: any`
    
    the `CurrencyId` or a list of `CurrencyId`'s of the tokens to be monitored.

2) `period: number`

    The amount of time in milliseconds between oracle queries.

For example:

```yaml
...
task: oracle.prices
arguments: 
    key: 
      Token: DOT
    period: 10000
...
```

## Output

The output for this task will be in the following format:

```typescript
{ 
    "key": string, // The token being monitored
    "value": string // The price of the token
}
```