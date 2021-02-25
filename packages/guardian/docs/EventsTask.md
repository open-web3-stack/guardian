# EventsTask

The `EventsTask` can be used to monitor one or more events on chain. It's identifier is `system.events`.

## Arguments

`EventsTask` takes the argument `name` of type `string` or `string[]` for monitoring multiple events, for example:

```yaml
...
task: system.events
arguments: 
    name: 
        - balances.Transfer
        - staking.Bonded
...
```

## Output

The output for this task will be in the following format:

```typescript
{
  "name": string,
  "args": {
    "arg1": string,
    "arg2": string,
    ...
  }
}
```

The key `args` will contain an object with keys `arg1` to `argn` where `n` is the total number of arguments in the event.