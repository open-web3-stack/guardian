# StorageTask

The `StorageTask` can be used to monitor one or more storage changes on chain. It's identifier is `system.storage`.

## Arguments

`StorageTask` takes the argument `name` of type `string` or `string[]` for monitoring multiple storages. 

`name` takes the form of `<pallet>.<storage>`.

`StorageTask` also takes an optional argument `args` of type `any | any[]` as the arguments to pass to the storage query.

For example:

```yaml
...
task: system.storage
arguments: 
    name: identity.identityOf

    args:
        - 5HmWP5WF24fchkiTqJPn5q2nrgFf3VD81LfdU7KRJLPve3fj # some address
...
```

Since `identity.identityOf` requires an account address as an argument we must supply it to `args`.

For storages that don't require any arguments it can be ommited,  for example:

```yaml
...
task: system.storage
arguments:
    name: system.number
...
```

## Output

The output for this task will be in the following format:

```typescript
{
  "name": string, // The name of the storage query
  "value": any // The value returned from the query
}
```