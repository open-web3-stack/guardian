# @open-web3/guardian

_Working In Progess_

## Overview

`guardian` is a CLI tool & JS library to monitor on chian states and events. When user defined criteria are met, it will execute a script or post a webhook to perform an action. This action can notify users, or initiate/participate in collateral auctions such as send a transaction.

See [#1](https://github.com/open-web3-stack/guardian/issues/1) for spec and example.

## Example

To use `guardian-cli` tool first install package globaly.

```
yarn global add @open-web3/guardian-cli
```

Create a YAML config file.

```
version: "0.1"
guardians:
  substrate-chain: # user defined

    networkType: substrateChain
    nodeEndpoint: wss://kusama-rpc.polkadot.io/

    monitors:
      accounts-monitor: # user defined
        task: system.accounts

        arguments:
          account:
            - 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
            - 5DAAzDBM2xoob4fcN4X7c8QXxZj7AEENfcMQWApUE6ALspWG

        actions:
          - method: script
            path: ./do_something # any script
```

Start guardian using command.

```
guardian-cli --config=./config.yaml
```

`guardian` will start monitoring and will execute script `do_something` when there's a balance change. The script can read the data from `stdin`.
