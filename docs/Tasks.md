# Tasks

The task's job is to listen to a single or mulitiple data sources and combine them into one preffered output format.

---
### Substrate
- [AccountsTask](AccountsTask.md)
- [EventsTask](EventsTask.md)
- [ScheduleBlockNumberTask](ScheduleBlockNumberTask.md)
- [ScheduleTimeTask](ScheduleTimeTask.md)
- [StorageTask](StorageTask.md)

### ORML
- [BalancesTask](BalancesTask.md)
- [PricesTask](PricesTask.md)

### Acala
- [CollateralAuctionsTask](CollateralAuctionsTask.md)
- [LoansTask](LoansTask.md)
- [PoolsTask](PoolsTask.md)

## Laminar
- [LiquidityPoolTask](LiquidityPoolTask.md)
- [PoolInfoTask](PoolInfoTask.md)
- [PositionsByTraderTask](PositionsByTraderTask.md)
- [TraderInfoTask](TraderInfoTask.md)
---

An example task might be [system.accounts](../src/tasks/substrate/AccountsTask.ts) whose job it is to monitor `Accounts` and output the data into the following format:

```typescript
{
  "account": string;
  "nonce": string;
  "free": string;
  "reserved": string;
  "misFrozen": string;
  "feeFroze": string;
}
```

Tasks can also take arguments i.e:
`AccountsTask` requires an argument which is `account: string | string[]` and it can be a single address or an array of addresses and is provided in the YAML config as follows:

```yaml
...
task: system.accounts
arguments: 
    account: # address
...
```
or multiple accounts:
```yaml
...
task: system.accounts
arguments: 
    account: 
        - # address_1
        - # address_2
...
```

**_NOTE:_** `system.accounts` is the AccountsTask identifier and is defined in `BaseSubstrateGuardian`

In order to setup a custom task you need to define 2 methods:

```typescript
export default class MyTask extends Task<ArgumentsType, OutputType> {
  validationSchema(): Joi.Schema {
    // return a joi schema used to validate provided arguments
  } 

  async start(guardian: IGuardian): Observable<OutputType> {
      // return output stream
  }
}
```
Then you can register your task to a guardian either by extending current guardians or creating a new one.