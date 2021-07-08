# Guardian examples

You can extend the YAML config files and run `Guardian` using option `--config=config.yml`.
Note: find update to date public node info [here](https://wiki.acala.network/learn/get-started/public-nodes).

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

## Application-specific Chain Example - Acala

### Collateral Auction Example
This example uses the `collateral auction` [yaml config file](https://github.com/open-web3-stack/guardian/blob/master/packages/example-guardian/src/collateral-auction-guardian.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/master/packages/example-guardian/src/auction/collateral). It will watch collateral auctions and dex pools, (dex is used to liquidate collaterals if price is more favorable) and bid from specified account. 

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=wss://mandala.laminar.codes/ws
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
MARGIN=0.1
```

2. Start guardian by running from project directory

```shell
 npx -p @open-web3/example-guardian@beta collateral-auction
```

You can extend [YAML config file](src/collateral-auction-guardian.yml) and run using option `--config=config.yml`

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/AcalaNetwork/collateral-auction-bot-template)

3. The log should show something like this  
```
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [acala-guardian] starting...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [AuctionDealt.system.events] starting ...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [CollateralAuction.honzon.collateralAuctions] starting ...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [AUSDBalance.account.balances] starting ...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [DEXPool.dex.pools] starting ...
0000-00-00000:00:00        REGISTRY: Unknown signed extensions SetEvmOrigin found, treating them as no-effect
0000-00-00000:00:00        REGISTRY: Unknown signed extensions SetEvmOrigin found, treating them as no-effect
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [AuctionDealt.system.events] is running ...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [CollateralAuction.honzon.collateralAuctions] is running ...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [AUSDBalance.account.balances] is running ...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [DEXPool.dex.pools] is running ...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [acala-guardian] is running ...
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [AUSDBalance.account.balances] output:  {
  account: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
  currencyId: '{"Token":"AUSD"}',
  free: '0'
}
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [AUSDBalance.account.balances] called [internal-balance]
0000-00-00000:00:00.000Z   LOG [@open-web3/guardian]: [DEXPool.dex.pools] output:  {
  currencyId: '[{"Token":"AUSD"},{"Token":"XBTC"}]',
  price: '23311448701827',
  baseLiquidity: '9970922954616215557',
  otherLiquidity: '427726439577067600000000'
}

```

#
### CDP Guardian Bot
This example uses the `cdp guardian` [yaml config file](https://github.com/open-web3-stack/guardian/blob/master/packages/example-guardian/src/cdp-guardian.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/master/packages/example-guardian/src/cdp). It will monitor specified account's loan positions. If the collateral ratio of the loans drops below a given threshold, it will deposit more liquidity to de-risk loan and keep the position open.

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=wss://mandala.laminar.codes/ws
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
COLLATERAL_RATIO=1.4
```

2. Start guardian by running from project directory

```shell
npx -p @open-web3/example-guardian@beta cdp
```

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/AcalaNetwork/cdp-bot-template)

#
## Application-specific Chain Example - Laminar
### Laminar Synthetic Liquidation Bot
This example uses the `laminar synthetic liquidation` [yaml config file](https://github.com/open-web3-stack/guardian/blob/master/packages/example-guardian/src/laminar-synthetic-liquidation-guardian.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/master/packages/example-guardian/src/laminar-synthetic-liquidation). It will monitor specified account's synthetic asset trading positions. If the collateral ratio of the trade drops below a given threshold, it will liquidate the position.

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=wss://node-6729167516986527744.jm.onfinality.io/ws
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
COLLATERAL_RATIO=1.04
```

2. Start guardian by running from project directory

```shell
npx -p @open-web3/example-guardian@beta laminar-synthetic-liquidation
```

### Laminar Margin Position Bot
This example uses the `laminar margin position` [yaml config file](https://github.com/open-web3-stack/guardian/blob/master/packages/example-guardian/src/laminar-margin-position-guardian.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/master/packages/example-guardian/src/laminar-margin-position). It will monitor specified account's margin positions. If the profit goes below a given threshold, it will close the position.

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=wss://testnet-node-1.laminar-chain.laminar.one/ws
SURI=//Charlie # your private key
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y # your address
PROFIT=-10000000000000000000 # close position if profit goes below -10aUSD
```

2. Start guardian by running from project directory

```shell
npx -p @open-web3/example-guardian@beta laminar-margin-position
```

#### Run on local testnet
1. Create a `.env` file in the project directory
```
NODE_ENDPOINT=ws://localhost:9944
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
PROFIT=-10000000000000000000 # close position if profit goes below -10aUSD
```
2. Run [laminar-chain](https://github.com/laminar-protocol/laminar-chain#building--running-laminarchain) local testnet with `--tmp` so it start from scratch or purge old chain data everytime you start the node
```
cargo run -- --dev --tmp
```

3. Start guardian by running from project directory
```shell
npx -p @open-web3/example-guardian@beta laminar-margin-position
```
4. Use laminar-e2e scripts to simulate the event. It prepares the environment, creates a position and drops the price
  ```shell
  TRADER=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y npx -p @laminar/e2e@beta simulate-margin-position
  ```
  You will see guardian calling action `close_position` and the bot will close it.
