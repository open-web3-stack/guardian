# ScheduleTimeTask

The `ScheduleTimeTask` can be used to schedule actions to be performed over a time interval . It's identifier is `schedule.time`.

## Arguments

`ScheduleTimeTask` takes the argument `cronTime: string`. The format must be in the cron format, for example:

```yaml
...
task: schedule.time
arguments: 
    cronTime: "*/5 * * * *" # Perform the action(s) every five minutes
...
```

## Output

The output for this task will be in the following format:

```typescript
{
  "current": number, // The current epoch timestamp
  "next": number // The next epoch timestamp the action(s) will run
}
```