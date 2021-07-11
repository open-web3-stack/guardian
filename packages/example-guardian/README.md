# Guardian examples

You can extend the YAML config files and run `Guardian` using option `--config=config.yml`.
Note: find the update to date public node info [here](https://wiki.acala.network/learn/get-started/public-nodes).

## Kusama Example

### Periodically Check Balance
This example uses the `scheduler` [yaml config file](https://github.com/open-web3-stack/guardian/blob/readme/packages/example-guardian/src/schedule.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/readme/packages/example-guardian/src/schedule). It will periodically (every s blocks) get the balance of a given address on the Kusama network.

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=wss://kusama-rpc.polkadot.io/
ADDRESS=GPkEmnRRzk65vw5fqZmaPbAmCGDKRWqXAgT3ydiQxHvqePE
```

2. Install globally `@open-web3/example-guardian@beta`

```shell=
yarn global add @open-web3/example-guardian@beta
```
![](https://i.imgur.com/NOUz1BL.png)
it installs few guardians: `cdp`, `collateral-auction`, ..., `schedule`. Many of them will be used later.

3. Start the Guardian by running this command in the directory with created `.env` file
```shell
schedule
```



4. The log should show something like this
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

2. Install globally `@open-web3/example-guardian@beta` (optional if you did it)

```shell=
yarn global add @open-web3/example-guardian@beta
```

3. Start the Guardian by running this command in the same directory with `.env` file
```shell
staking
```

## Application-specific Chain Example - Acala

### Collateral Auction Example
This example uses the `collateral auction` [yaml config file](https://github.com/open-web3-stack/guardian/blob/master/packages/example-guardian/src/collateral-auction-guardian.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/master/packages/example-guardian/src/auction/collateral). It will watch collateral auctions and dex pools, (dex is used to liquidate collaterals if the price is more favourable) and bid from the specified account. 

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=wss://mandala.laminar.codes/ws
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
MARGIN=0.1
```

2. Install globally `@open-web3/example-guardian@beta` (optional if you did it)

```shell=
yarn global add @open-web3/example-guardian@beta
```


3. Start guardian by running from the directory with `.env` file

```shell
collateral-auction
```

You can extend [YAML config file](src/collateral-auction-guardian.yml) and run using the option `--config=config.yml`

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
This example uses the `cdp guardian` [yaml config file](https://github.com/open-web3-stack/guardian/blob/master/packages/example-guardian/src/cdp-guardian.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/master/packages/example-guardian/src/cdp). It will monitor specified account's loan positions. If the collateral ratio of the loans drops below a given threshold, it will deposit more liquidity to de-risk the loan and keep the position open.

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=wss://mandala.laminar.codes/ws
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
COLLATERAL_RATIO=1.4
```

2. Install globally `@open-web3/example-guardian@beta` (optional if you did it)

```shell=
yarn global add @open-web3/example-guardian@beta
```

2. Start guardian by running from the directory with `.env` file

```shell
cdp
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

2. Install globally `@open-web3/example-guardian@beta` (optional if you did it)

```shell=
yarn global add @open-web3/example-guardian@beta
```

2. Start guardian by running from the directory with `.env` file

```shell
laminar-synthetic-liquidation
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

2. Install globally `@open-web3/example-guardian@beta` (optional if you did it)

```shell=
yarn global add @open-web3/example-guardian@beta
```

3. Start guardian by running from project directory with `.env` file

```shell
laminar-margin-position
```

### Running Examples on local testnet

All of the shown here examples can be ran on a local testnet. Besides having full control over your local chain, we have a bunch of scripts to simulate behaviour that will trigger guardian to act:
- [acala-e2e](https://github.com/AcalaNetwork/e2e) simulations to test Acala guardians: `simulate-liquidate-cdp`, `simulate-loan`
- [laminar-e2e](https://github.com/laminar-protocol/e2e) simulations to test laminar guardians: `simulate-liquidate-synthetic-pool`, `simulate-margin-position`

In this example, we will run **Margin Position Bot** on a local chain and will use `simulate-margin-position` to trigger it.

#### Margin Position Bot on local testnet

1. Create a `.env` file in the project directory
```
NODE_ENDPOINT=ws://localhost:9944
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
PROFIT=-10000000000000000000 # close position if profit goes below -10aUSD
```
2. Run [laminar-chain](https://github.com/laminar-protocol/laminar-chain#building--running-laminarchain) local testnet with `--tmp` so it starts from scratch or purges old chain data every time you start the node
```
cargo run -- --dev --tmp
```

2. Install globally `@open-web3/example-guardian@beta` (optional if you did it)

```shell=
yarn global add @open-web3/example-guardian@beta
```

3. Start guardian by running from the directory with `.env` file
```shell
laminar-margin-position
```
4. Open another terminal and navigate to the same folder **WITHOUT** `.env` file, otherwise, it will override standard dependencies.
5. Install laminar e2e simulations globally

```shell=
yarn global add @laminar/e2e
```
The output should look like:
![](https://i.imgur.com/poXicL4.png)

It shows that the library has two available scripts: `simulate-liquidate-synthetic-pool` and `simulate-margin-position`

> Note :warning:  : in the same way you can install e2e examples for acala.

7. Run simulation scripts to simulate the event. It prepares the environment, creates a position and drops the price

```shell
TRADER=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y simulate-margin-position
```
We pass `TRADER` environment variable with `Charlie` account address.
>:warning: be sure that TRADER account number is the same  account in `.env` file in Margin Position Guardian Bot (in our case Charlie's address)

The output of running the simulator should look like this:
![](https://i.imgur.com/xR2ztRo.png)

And you should see in your Guardian Bot terminal window activity of calling action `close_position`:

![](https://i.imgur.com/OZ6x4pl.png)

You can also navigate to https://polkadot.js.org/apps/#/explorer, connect to the local node and check the events happening in the **Network** -> **Explorer** tab, to check all events were happening:

![](https://i.imgur.com/nDNiWvx.png)

>:warning: you may see the empty event list if you ran guardian and simulation after you opened the polkadot.js.org/apps, as it may not pick up these events. In this case, you should rerun the guarding and simulation, and all events will show up.