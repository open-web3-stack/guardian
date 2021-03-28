# ScheduleBlockNumberTask

The `ScheduleBlockNumberTask` can be used to schedule actions to run on a given block number interval. It's identifier is `schedule.blockNumber`.

## Arguments

`ScheduleBlockNumberTask` takes three arguments:

1) `startNumber?: number`
    
    An optional argument that designates at what block number actions will start being performed. If left blank it will start at the next block.

2) `step: number`
    
    The number of blocks between actions, i.e. if `step` is 1 an action will be performed at every new block.

3) `finalized: bool`
    
    If true actions will run on finalized blocks best blocks.

For example:

```yaml
...
task: schedule.blockNumber
arguments:
    startNumber: 3957116 # The block number to start at
    step: 5 # The number of blocks between performing the action(s)
    finalized: true # Whether to run on finalized or best blocks
...
```

## Output

The output for this task will be in the following format:

```typescript
{
    "current": number, // The current block number
    "next": number  // The next block number when the action(s) will be performed
}
```