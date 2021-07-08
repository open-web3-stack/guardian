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
This example uses the `laminar synthetic liquidation` [yaml config file](https://github.com/open-web3-stack/guardian/blob/master/packages/example-guardian/src/laminar-synthetic-liquidation-guardian.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/master/packages/example-guardian/src/laminar-synthetic-liquidation). 
This example uses the laminar synthetic liquidation yaml config file and task source code here. It will monitor specified account's synthetic pools. If the collateral ratio of the pool drops below a liquidation threshold, it will liquidate the pool.

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=wss://testnet-node-1.laminar-chain.laminar.one/ws
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
COLLATERAL_RATIO=1.04
```

2. Start guardian by running from project directory

```shell
npx -p @open-web3/example-guardian@beta laminar-synthetic-liquidation
```

### Running bot on local testnet

The best way to test how the guardian is to run it on your local testnet where you have full control.

1. **Run local laminar node**

You can follow the guide for installing Rust and dependencies: https://github.com/laminar-protocol/laminar-chain#building--running-laminarchain

clone laminar-chain repo
```
git clone https://github.com/laminar-protocol/laminar-chain.git
cd laminar-chain
```

install toolchain
```
make init
```

run the node with `--tmp` flag to build ledger from scratch
```
SKIP_WASM_BUILD= cargo run -- --dev -lruntime=debug --tmp
```

When the node is successfully running, it should look like this:
![](https://i.imgur.com/ksVj9WM.png)

2. Run `laminar-synthetic-liquidation` guardian

Clone guardian repository
```
git clone https://github.com/open-web3-stack/guardian.git
cd guardian
```

navigate to `guarding-example` folder
```
cd packages/guardian/example-guardian
```

install dependencies
```
yarn
```

> :warning: make sure you are using the latest version of `yarn` and 16.x.x `node` version  

All environment variables with standart local node endpoint are predefined in the [.env.laminar-synthetic-liquidation](https://github.com/open-web3-stack/guardian/blob/master/packages/example-guardian/.env.laminar-synthetic-liquidation)
```
NODE_ENDPOINT=ws://localhost:9944
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
COLLATERAL_RATIO=1.1
```

And now you can run the guardian:
```
yarn dev:laminar-synthetic-liquidation
```
You will the similar screen:
![](https://i.imgur.com/wmlzd98.png)

The guardian is constantly checking the synthetic pool ratio and once it will drop below the liquidation threshold, the guarding will liquidate the pool.

3. Emulating the drop of synthetic pool ration

For emulation of drop synthetic pool ration we will use laminar-e2e tests from the repo: [laminar-protocol/e2e](https://github.com/laminar-protocol/e2e)

Clone the repo & install dependencies:
```
git clone https://github.com/laminar-protocol/e2e.git laminar-e2e
cd laminar-e2e
yarn
```

Run the simulation with providing the environment variable `OWNER`. We set it to the standard dev account `Charlie` with a fixed account address. Feel free to change it both in the guardian and e2e test.
```
OWNER=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y yarn dev:simulate-liquidate-synthetic-pool
```

The guardian should pick the changes and show the result like in the screenshot:

![](https://i.imgur.com/GvuFf2A.png)

You can verify the set of actions that were taken in the polkadot.js.org/apps. 

Navigate to https://polkadot.js.org/apps and connect to local node: Select the local node and click "Switch"
![](https://i.imgur.com/VtIMv1c.png)

After navigate to Network -> Explorer and in the list of events you will be able to see a number of events, with the last one `syntheticProtocol.Liquidated`

![](https://i.imgur.com/czSGefR.png)

> :warning: you may see the empty screen if you ran the script before you opened polkadot.js.org/apps as it may not fetch all system events recently happened. You can repeat the set of actions to have all events in the browser cache.