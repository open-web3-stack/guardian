# PricesTask

The `PricesTask` can be used to query a chain's oracle for token prices on a fixed interval. It's identifier is `oracle.prices`.

## Arguments

`PricesTask` takes two arguments:

1) `key: string | string[]`
    
    The token, or a list of tokens you want to monitor the oracle price of. If `all` is provided to this argument all available tokens will be monitored.

2) `period: number`

    The amount of time in milliseconds between oracle queries.

For example:

```yaml
...
task: oracle.prices
arguments: 
    key: DOT
    period: 10000
...
```

## Output

The output for this task will be in the following format:

```typescript
{ 
    key: 'string', // The token being monitored
    value: '1000000000000000000' // The price of the token
}
```