# LoansTask

The `LoansTask` can be used to monitor one or more accounts for changes in aUSD loans. It's identifier is `honzon.loans`.

## Arguments

`LoansTask` takes two arguments:

1) `account: string | string[]`

    The account address, or a list of account addresses to monitor.

2) `currencyId: any | "all"`

    The token or a list of tokens used by the account as collateral for their loans. The argument `all` can also be supplied to monitor all loans on the  given account(s).

For example:

```yaml
...
task: honzon.loans
arguments:
    account:            
        - 5EHyc8XcDAaTJQN8TRd6xc5SVqQ8zg3q7svDeQ6TvzHvYsDv
        - 5HmWP5WF24fchkiTqJPn5q2nrgFf3VD81LfdU7KRJLPve3fj
    currencyId:    
        - Token: DOT
        - Token: XBTC
...
```

## Output

The output for this task will be in the following format:

```typescript
{
  "account": string,
  "currencyId": string,
  "debits": string,
  "debitsUSD": string,
  "collaterals": string,
  "collateralRatio": string
}
```