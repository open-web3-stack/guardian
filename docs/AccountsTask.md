# AccountsTask

The `AccountsTask` can be used to monitor one or more accounts for changes. It's identifier is `system.accounts`.

## Arguments

`AccountsTask` takes the argument `account` of type `string` or `string[]` for monitoring multiple accounts, for example:

```yaml
...
task: system.accounts
arguments: 
    account: 
        - 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQ # Alice's address
        - 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty # Bob's address
...
```

## Output

The output for this task will be in the following format:

```typescript
{
  "account": string;
  "nonce": number;
  "free": number;
  "reserved": number;
  "misFrozen": number;
  "feeFroze": number;
}
```