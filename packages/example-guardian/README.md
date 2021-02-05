# Guardian examples

## Kusama Example

### Periodically Check Balance
This example uses the `scheduler` [yaml config file](https://github.com/open-web3-stack/guardian/blob/readme/packages/example-guardian/src/schedule.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/readme/packages/example-guardian/src/schedule). It will periodically (every s blocks) to get balance of a given address on the Kusama network.

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=wss://kusama-rpc.polkadot.io/
ADDRESS=GPkEmnRRzk65vw5fqZmaPbAmCGDKRWqXAgT3ydiQxHvqePE
```

2. Start the Guardian by running this command in the same directory
```shell
npx -p @open-web3/example-guardian@beta schedule
```

3. The log should show something like this
```
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [substrate-chain] starting...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [time-monitor.schedule.time] starting ...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [blockNumber-monitor.schedule.blockNumber] starting ...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [time-monitor.schedule.time] is running ...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [blockNumber-monitor.schedule.blockNumber] is running ...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [substrate-chain] is running ...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [blockNumber-monitor.schedule.blockNumber] output:  { current: 6074807, next: 6074809 }
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [blockNumber-monitor.schedule.blockNumber] called [getBalance]
0000-00-00000:00:00.000Z   LOG [@open-web3/example-guardian]: balance:  {
  nonce: '120',
  refcount: '1',
  data: {
    free: '4.0020 kKSM',
    reserved: '1.0083 KSM',
    miscFrozen: '4.0003 kKSM',
    feeFrozen: '4.0003 kKSM'
  }
}
```
### Staking Reward Notification Example
This example uses the `staking` [yaml config file](https://github.com/open-web3-stack/guardian/blob/readme/packages/example-guardian/src/staking.yml) and tasks source code [here](https://github.com/open-web3-stack/guardian/tree/readme/packages/example-guardian/src/staking). It will check for staking reward event for a given address on the Kusama network, and send out an email notification if there's an event. Currently reward is given out once a day.

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=wss://kusama-rpc.polkadot.io/
ADDRESS=CzBwcfFuWHRw5JJ3ZZF5xWvKZKrvQgcsg2XJPUwMLx9fm1u
```

2. Start the Guardian by running this command in the same directory
```shell
npx -p @open-web3/example-guardian@beta staking
```


## Collateral Auction Example

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=ws://localhost:9944
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
MARGIN=0.1
```

2. Start guardian by running from project directory

```shell
 npx -p @open-web3/example-guardian@beta collateral-auction-guardian
```

You can extend [YAML config file](src/collateral-auction-guardian.yml) and run using option `--config=config.yml`

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/AcalaNetwork/collateral-auction-bot-template)

#

## Debit Auction Example

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=ws://localhost:9944
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
MARGIN=0.1
```

2. Start guardian by running from project directory

```shell
npx -p @open-web3/example-guardian@beta debit-auction-guardian
```

You can extend [YAML config file](src/debit-auction-guardian.yml) and run using option `--config=config.yml`

#

## Surplus Auction Example

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=ws://localhost:9944
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
MARGIN=0.1
```

2. Start guardian by running from project directory

```shell
npx -p @open-web3/example-guardian@beta surplus-auction-guardian
```

You can extend [YAML config file](src/surplus-auction-guardian.yml) and run using option `--config=config.yml`

#

## Laminar Synthetic Liquidation Bot

### _working in progress..._

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=ws://localhost:9944
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
COLLATERAL_RATIO=1.04
```

2. Start guardian by running from project directory

```shell
npx -p @open-web3/example-guardian@beta laminar-synthetic-liquidation-guardian`
```

You can extend [YAML config file](src/laminar-synthetic-liquidation-guardian.yml) and run using option `--config=config.yml`

#

# CDP Guardian Bot

CDP Guardian Bot will monitor your loans and if the collateral ratio drops
below a certain threshold it will deposit more liquidity to maintain the loan safe.

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=ws://localhost:9944
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
COLLATERAL_RATIO=1.4
```

2. Start guardian by running from project directory

```shell
npx -p @open-web3/example-guardian@beta cdp-guardian
```

You can extend [YAML config file](src/cdp-guardian.yml) and run using option `--config=config.yml`

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/AcalaNetwork/cdp-bot-template)
