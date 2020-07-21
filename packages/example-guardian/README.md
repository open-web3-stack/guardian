## Collateral Auction Example

Start collateral auction guardian `NODE_ENDPOINT=ws://localhost:9944 MARGIN=0.1 BIDDER_SURI=//Charlie BIDDER_ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y npx @open-web3/example-guardian@beta collateral-auction-guardian`

You can extend [YAML config file](resources/collateral-auction-guardian.yml) and run using option `--config=config.yml`

## Debit Auction Example

Start debit auction guardian `NODE_ENDPOINT=ws://localhost:9944 MARGIN=0.1 BIDDER_SURI=//Charlie BIDDER_ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y npx @open-web3/example-guardian@beta debit-auction-guardian`

You can extend [YAML config file](resources/debit-auction-guardian.yml) and run using option `--config=config.yml`

## Surplus Auction Example

Start surplus auction guardian `NODE_ENDPOINT=ws://localhost:9944 MARGIN=0.1 BIDDER_SURI=//Charlie BIDDER_ADDRESS=5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y npx @open-web3/example-guardian@beta surplus-auction-guardian`

You can extend [YAML config file](resources/surplus-auction-guardian.yml) and run using option `--config=config.yml`

## Liquidation Bot

1. Create `config.yml` like:

```yaml
version: '0.1'
guardians:
  ethereum:
    networkType: ethereum
    network: kovan
    nodeEndpoint: ${NODE_ENDPOINT} # or wss://kovan.infura.io/ws/v3/YOUR-PROJECT-ID
    monitors:
      syntheticPoolGeneric:
        task: synthetic.pools
        arguments:
          poolId: '0x61A7645ef693Ea7740b121232Ddc7b874Be7Fa09'
          tokenName: all
        conditions:
          - collateralRatio: <= 1.04
        actions:
          - method: ethereumLiquidate

      syntheticPoolXYZ:
        task: synthetic.pools
        arguments:
          poolId: '0x2b1627CFF4Eb38C774Ec1008045CEd2C4776eEf6'
          tokenName: all
        conditions:
          - collateralRatio: <= 1.04
        actions:
          - method: ethereumLiquidate
```

2. Start guardian by running

```shell
NODE_ENDPOINT=wss://kovan.infura.io/ws/v3/YOUR-PROJECT-ID npx @open-web3/example-guardian@beta liquidation-guardian --config config.yaml`
```
