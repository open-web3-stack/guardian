# Tasks

The task job is to listen to a single or multiple data sources and combined them into preferred output format. 

---
### Substrate
- [AccountsTask](packages/guardian/docs/AccountsTask.md)
- [EventsTask](packages/guardian/docs/EventsTask.md)
- [ScheduleBlockNumberTask](packages/guardian/docs/ScheduleBlockNumberTask.md)
- [ScheduleTimeTask](packages/guardian/docs/ScheduleTimeTask.md)
- [StorageTask](packages/guardian/docs/StorageTask.md)

### ORML
- [BalancesTask](packages/guardian/docs/BalancesTask.md)
- [PricesTask](packages/guardian/docs/PricesTask.md)

### Acala
- [CollateralAuctionsTask](packages/guardian/docs/CollateralAuctionsTask.md)
- [DebitAuctionsTask](packages/guardian/docs/DebitAuctionsTask.md)
- [LoansTask](packages/guardian/docs/LoansTask.md)
- [PoolsTask](packages/guardian/docs/PoolsTask.md)
- [SurplusAuctionsTask](packages/guardian/docs/SurplusAuctionsTask.md)

## Laminar
- [LiquidityPoolTask](packages/guardian/docs/LiquidityPoolTask.md)
- [PoolInfoTask](packages/guardian/docs/PoolInfoTask.md)
- [PositionsByTraderTask](packages/guardian/docs/PositionsByTraderTask.md)
- [TraderInfoTask](packages/guardian/docs/TraderInfoTask.md)

---

An example task might be [system.accounts](packages/guardian/src/tasks/substrate/AccountsTask.ts) which job is to monitor `Accounts` and output the data into format: 
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