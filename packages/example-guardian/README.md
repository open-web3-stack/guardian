# Guardian examples

## Collateral Auction Example

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=ws://localhost:9944
BIDDER_SURI=//Charlie
BIDDER_ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
MARGIN=0.1
```

2. Start guardian by running from project directory

```shell
 npx -p @open-web3/example-guardian@beta collateral-auction-guardian
```

You can extend [YAML config file](resources/collateral-auction-guardian.yml) and run using option `--config=config.yml`

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/AcalaNetwork/collateral-auction-bot-template)

#

## Debit Auction Example

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=ws://localhost:9944
BIDDER_SURI=//Charlie
BIDDER_ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
MARGIN=0.1
```

2. Start guardian by running from project directory

```shell
npx -p @open-web3/example-guardian@beta debit-auction-guardian
```

You can extend [YAML config file](resources/debit-auction-guardian.yml) and run using option `--config=config.yml`

#

## Surplus Auction Example

1. Create a `.env` file in the project directory

```
NODE_ENDPOINT=ws://localhost:9944
BIDDER_SURI=//Charlie
BIDDER_ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
MARGIN=0.1
```

2. Start guardian by running from project directory

```shell
npx -p @open-web3/example-guardian@beta surplus-auction-guardian
```

You can extend [YAML config file](resources/surplus-auction-guardian.yml) and run using option `--config=config.yml`

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

You can extend [YAML config file](resources/laminar-synthetic-liquidation-guardian.yml) and run using option `--config=config.yml`

#

# CDP Guardian Bot

CDP Guardian Bot will monitor your loans and if the collateral ratio drops
below a certain threshold it will deposit more liquidity to mantain the loan safe.

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

You can extend [YAML config file](resources/cdp-guardian.yml) and run using option `--config=config.yml`
