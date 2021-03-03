# BalancesTask

The `BalancesTask` can be used to monitor one or more accounts for changes in different currencies. It's identifier is `account.balances`.

## Arguments

`BalancesTask` takes two arguments:

1) `account: string | string[]`
    
    The account or list of accounts to monitor.

2) `currencyId: any`

    The value passed to `currencyId` can take several different forms. It can be an ID by itself, or a list of several ID's you'd like to monitor. Additionally if there are several options within one `currencyId` you can specify which one you'd like to monitor. If you don't specify it will use some default value.

for example:

```yaml
...
task: account.balances
arguments:
    account: 5HmWP5WF24fchkiTqJPn5q2nrgFf3VD81LfdU7KRJLPve3fj
    currencyId:
    - Token # Running this guardian on Acala this defaults to ACA
    - Token: DOT 
...
```

## Output

The output for this task will be in the following format:

```typescript
{
  "account": string, // The account that had the change
  "currencyId": any, // The currencyId taht had the change
  "free": string // The current amount free as a string
}
```