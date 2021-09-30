# Guardian examples

Here are presented different use cases for Guardian with running as in development environment and production.

Each of the examples contains 2 parts:
1. Guardian config `config.yml` that describes types of events to subscribe to.
2. Node.js scripts that are fired if a certain event was emitted.

Both of the scripts can be customized.

## Setting up the environment

Cloning project, navigating to the examples folder

```shell=
git clone https://github.com/open-web3-stack/guardian.git
cd guardian/packages/example-guardian
```

Installing dependencies
```shell=
yarn 
```

## Setting up the network

Each of the examples is meant to work on the respective network: Acala, Karura, Laminar, Kusama, Polkadot, etc. 

You can find some public nodes [here](https://wiki.acala.network/learn/get-started/public-nodes).

You may want to try the scripts running your local testnet. For some examples like Bots for Liquidations, it may be more convenient as it's way easier to trigger liquidation in the network you can control. 
To run local testnets you need to follow guides in the respective projects.

Each example is provided with `.env.<example-name>` file that contains an example of configuration, and includes network:
`NODE_ENDPOINT` environment variable.
For local testnet it conventionally equals `ws://localhost:9944`.

### Running Laminar local node

Using `docker`:
```shell=
docker run --rm -p 9944:9944  laminar/laminar-node:latest \
--dev --ws-external --rpc-methods=unsafe \
-levm=trace --tmp
```

To build the project without `docker` use the guidelines here:
[**laminar-protocol/laminar-chain**](https://github.com/laminar-protocol/laminar-chain)
Run the node with:
```
cargo run -- --dev --tmp
```

### Running Acala local node

Using `docker`:
```shell=
docker run --rm -p 9944:9944 acala/mandala-node:latest \
--dev --ws-external --rpc-methods=unsafe \
--instant-sealing  -levm=trace --tmp
```

To build the project without docker use the guidelines here:
[**AcalaNetwork/Acala**](https://github.com/AcalaNetwork/Acala)
Run the node with:
```
cargo run -- --dev --tmp
```

## Simulations  

To help you trigger certain events and to ensure that the bot picks them up we provide sets of emulations:
- for Acala: https://github.com/AcalaNetwork/e2e
- for Laminar: https://github.com/laminar-protocol/e2e

In this guide, we provide a way how to use them.


You can extend the YAML config files and run `Guardian` using option `--config=config.yml`.
Note: find the update to date public node info [here](https://wiki.acala.network/learn/get-started/public-nodes).

## Heroku Deployment 

All presented examples can be automatically deployed to Heroku for use in production. Here you can find an example for Dex Price bot and a way how to modify it with other samples: 

**[Dex Price Heroku Deployment](https://github.com/AcalaNetwork/guardian-bot-heroku-template)**

---
# Bots

## Periodic Checking balance in Kusama

This example uses the `scheduler` [yaml config file](https://github.com/open-web3-stack/guardian/blob/readme/packages/example-guardian/src/schedule.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/readme/packages/example-guardian/src/schedule). It will periodically (every s blocks) get the balance of a given address on the Kusama network.

The configuration file you can find here:
[.env.schedule](https://github.com/open-web3-stack/guardian/blob/5b88526b37ffce7ad3e1c570f33e9ce756554112/packages/example-guardian/.env.schedule)

It cointains next env variables:
```shell=
NODE_ENDPOINT=wss://kusama-rpc.polkadot.io/
ADDRESS=<YOUR_KUSAMA_ADDRESS>
```

Run in **dev** mode:
```shell=
yarn dev:schedule
```

Run in **prod** mode:
```shell=
yarn prod:schedule
```

The output should look like this:
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

## Staking Reward Notifications for Kusama

This example uses the `staking` [yaml config file](https://github.com/open-web3-stack/guardian/blob/readme/packages/example-guardian/src/staking.yml) and tasks source code [here](https://github.com/open-web3-stack/guardian/tree/readme/packages/example-guardian/src/staking). It will check staking reward event for a given address on the Kusama network, and send out an email notification if there's an event. Currently reward is given out once a day.

The configuration file you can find here:
[.env.staking](https://github.com/open-web3-stack/guardian/blob/33c399ba3f4d5b3923a2479d2dc8fcee803bf96e/packages/example-guardian/.env.staking)

It cointains next env variables:
```shell=
NODE_ENDPOINT=wss://kusama-rpc.polkadot.io/
ADDRESS=<YOUR_KUSAMA_ADDRESS>
```

This Bot can be used for the following rewards for 3d party protocols built on top on top of Polkadot/Kusama staking.
One of them is Karura Staking Derivative. You can check the rewards using providing L-KSM staking address:
`HTAeD1dokCVs9MwnC1q9s2a7d2kQ52TAjrxE1y5mj5MFLLA`. To check the rewards in UI, use the [link here](https://kusama.subscan.io/account/HTAeD1dokCVs9MwnC1q9s2a7d2kQ52TAjrxE1y5mj5MFLLA).

Run in **dev** mode:
```shell=
yarn dev:staking
```

Run in **prod** mode:
```shell=
yarn prod:staking
```


## Collateral Auction Bot for Acala/Karura

This example uses the `collateral auction` [yaml config file](https://github.com/open-web3-stack/guardian/blob/master/packages/example-guardian/src/collateral-auction-guardian.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/master/packages/example-guardian/src/auction/collateral). It will watch collateral auctions and DEX pools, (DEX is used to liquidate collaterals if the price slippage is acceptable) and bid from the specified account if the price of collater is lower than the price from Price oracle for `MARGIN` coefficient. 

Configuration file you can find here:
[.env.auction](https://github.com/open-web3-stack/guardian/blob/d9b5a2a82f84d4a1909f7ef1d4bb868ddb1105fb/packages/example-guardian/.env.auction)

It cointains next env variables:
```shell=
NODE_ENDPOINT=ws://localhost:9944
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
MARGIN=0.1
```

> Note :warning: to test out this example it's recommended to use a local testnet.


Run in **dev** mode:
```shell=
yarn dev:collateral-auction
```

Run in **prod** mode:
```shell=
yarn prod:collateral-auction
```

####  Liquidation Simulation 


The liquidation simulation script will work only for your local Acala testnet, you should ensure that it's running.

To use simulation you need to clone the repository and run the simulation script:
```shell=
git clone https://github.com/AcalaNetwork/e2e.git acala-simulations
cd acala-simulations
```
Install dependencies:
```
yarn
```

Run simulation:
```shell=
yarn dev:simulate-liquidate-cdp
```




## Monitoring Loans Bot for Acala/Karura

This example uses the `cdp guardian` [yaml config file](https://github.com/open-web3-stack/guardian/blob/master/packages/example-guardian/src/cdp-guardian.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/master/packages/example-guardian/src/cdp). It will monitor specified account's loan positions. If the collateral ratio of the loans drops below a given threshold (`COLLATERAL_RATIO`) for a selected account (`ADDRESS`), it will deposit more liquidity to de-risk the loan and keep the position open.


Configuration file you can find here:
[.env.cdp](https://github.com/open-web3-stack/guardian/blob/d9b5a2a82f84d4a1909f7ef1d4bb868ddb1105fb/packages/example-guardian/.env.cdp)

It cointains next env variables:
```shell=
NODE_ENDPOINT=ws://localhost:9944
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
COLLATERAL_RATIO=1.4
```

> Note :warning: to test out this example it's recommended to use a local testnet. 

Run in **dev** mode:
```shell=
yarn dev:cdp
```

Run in **prod** mode:
```shell=
yarn prod:cdp
```

####  Loan collater ratio drop Simulation 


The Loan collater ratio drop simulation script will work only for your local Acala testnet, you should ensure that it's running.

To use simulation you need to clone the repository and run the simulation script:
```shell=
git clone https://github.com/AcalaNetwork/e2e.git acala-simulations
cd acala-simulations
```
Install dependencies:
```
yarn
```

Run simulation:
```shell=
yarn dev:dev:simulate-loan
```


## Dex Price Guardian Bot for Acala/Karura

This example uses the `dex-price guardian` [yaml config file](https://github.com/open-web3-stack/guardian/blob/master/packages/example-guardian/src/dex-price-guardian.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/master/packages/example-guardian/src/dex-price). It will monitor a specified liquidity pair (`TOKEN_A` and `TOKEN_B`) and perform an action whenever there is a price change for that pair.

Configuration file you can find here:
[.env.dex-price](https://github.com/open-web3-stack/guardian/blob/33c399ba3f4d5b3923a2479d2dc8fcee803bf96e/packages/example-guardian/.env.dex-price)

It cointains next env variables:
```shell=
NODE_ENDPOINT=wss://karura.api.onfinality.io/public-ws
TOKEN_A=KUSD
TOKEN_B=KSM
```

Run in **dev** mode:
```shell=
yarn dev:dex-price
```

Run in **prod** mode:
```shell=
yarn prod:dex-price
```

## Synthetic Liquidation Bot for Laminar
This example uses the `laminar synthetic liquidation` [yaml config file](https://github.com/open-web3-stack/guardian/blob/master/packages/example-guardian/src/laminar-synthetic-liquidation-guardian.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/master/packages/example-guardian/src/laminar-synthetic-liquidation). It will monitor specified account's (`ADDRESS`) synthetic asset trading positions. If the collateral ratio of the trade drops below a given threshold (`COLLATERAL_RATIO`), it will liquidate the position.


Configuration file you can find here:
[.env.laminar-synthetic-liquidation](https://github.com/open-web3-stack/guardian/blob/d9b5a2a82f84d4a1909f7ef1d4bb868ddb1105fb/packages/example-guardian/.env.laminar-synthetic-liquidation)

It cointains next env variables:
```shell=
NODE_ENDPOINT=ws://localhost:9944
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
COLLATERAL_RATIO=1.1
```

> Note :warning: to test out this example it's recommended to use **local testnet**.

Run in **dev** mode:
```shell=
yarn dev:laminar-synthetic-liquidation
```

Run in **prod** mode:
```shell=
yarn prod:laminar-synthetic-liquidation
```

####  Synthetic pool liquidation Simulation   

The synthetic pool liquidation simulation script will work only for your local **Laminar** testnet, you should ensure that it's running.

To use simulation you need to clone the repository and run the simulation script:
```shell=
git clone https://github.com/laminar-protocol/e2e.git laminar-simulations
cd laminar-simulations
```
Install dependencies:
```
yarn
```

Run simulation:
```shell=
yarn dev:simulate-liquidate-synthetic-pool
```

Simulation output should look like this:

![simulation-output](https://i.imgur.com/9cZpRUG.png)

The bot should pick up the event and display the next output:

![synthetic-position-output](https://i.imgur.com/osmwnXk.png)


## Laminar Margin Position Bot

This example uses the `laminar margin position` [yaml config file](https://github.com/open-web3-stack/guardian/blob/master/packages/example-guardian/src/laminar-margin-position-guardian.yml) and task source code [here](https://github.com/open-web3-stack/guardian/tree/master/packages/example-guardian/src/laminar-margin-position). It will monitor specified account's margin positions. If the profit goes below a given threshold, it will close the position.


Configuration file you can find here:
[.env.laminar-margin-position](https://github.com/open-web3-stack/guardian/blob/d9b5a2a82f84d4a1909f7ef1d4bb868ddb1105fb/packages/example-guardian/.env.laminar-margin-position)

It cointains next env variables:
```shell=
NODE_ENDPOINT=ws://localhost:9944
SURI=//Charlie
ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
# close position if profit goes below -10aUSD
PROFIT=-10000000000000000000 
```

> Note :warning: to test out this example it's recommended to use **local testnet**. 

Run in **dev** mode:
```shell=
yarn dev:laminar-margin-position
```

Run in **prod** mode:
```shell=
yarn prod:laminar-margin-position
```

###  Margin position price drop Simulation  

The Margin position price drop simulation script will work only for your local **Laminar** testnet, you should ensure that it's running.

To use simulation you need to clone the repository and run the simulation script:
```shell=
git clone https://github.com/laminar-protocol/e2e.git laminar-simulations
cd laminar-simulations
```
Install dependencies:
```
yarn
```

Run simulation:
```shell=
yarn dev:simulate-margin-position
```

The simulation terminal should look like this:
![](https://i.imgur.com/mXaONb2.png)


The bot terminal should pick up the dropped position and display it like this:
![](https://i.imgur.com/FuqI43b.png)

### Checking results of simulations, bots activity in web UI

You can also navigate to https://polkadot.js.org/apps/#/explorer, connect to the local node and check the events happening in the **Network** -> **Explorer** tab, to check all events were happening:

![](https://i.imgur.com/nDNiWvx.png)

>:warning: you may see the empty event list if you ran guardian and simulation after you opened the polkadot.js.org/apps, as it may not pick up these events. In this case, you should rerun the guarding and simulation, and all events will show up.