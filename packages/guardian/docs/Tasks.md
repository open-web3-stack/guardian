# Tasks

The task job is to listen to a single or multiple data sources and combined them into preferred output format. 

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
- [DebitAuctionsTask](DebitAuctionsTask.md)
- [LoansTask](LoansTask.md)
- [PoolsTask](PoolsTask.md)
- [SurplusAuctionsTask](SurplusAuctionsTask.md)

## Laminar
- [LiquidityPoolTask](LiquidityPoolTask.md)
- [PoolInfoTask](PoolInfoTask.md)
- [PositionsByTraderTask](PositionsByTraderTask.md)
- [TraderInfoTask](TraderInfoTask.md)
---

An example task might be [system.accounts](../src/tasks/substrate/AccountsTask.ts) which job is to monitor `Accounts` and output the data into format: 
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
Tasks can also take arguments i.e:
`AccountsTask` requires an argument which is `account: string | string[]` and it can be a single address or and array of addresses and it's provided in YAML config like:
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

**_NOTE:_** `system.accounts` is AccountsTask identifier and is defined on `BaseSubstrateGuardian`

In order to setup a task you need to define 2 methods:
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
Then you register your task to a guardian either by extending current guardians or creating a new one.