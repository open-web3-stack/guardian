# @open-web3/guardian

## Overview

The goal of this project is to by mere configuration, we can set up a `Guardian` for a chain of concern, along with a number of tasks for monitoring and execution purposes. A task can be `monitoring margin positions` with conditions (if collateral ratio < 110%) then trigger actions (e.g. post warning message to database service, or execute a script to add position).

`guardian` is a CLI tool & JS library to monitor on-chain states and events. When user defined criteria are met, it will execute a script or post a webhook to perform an action. This action can notify users, or initiate/participate in collateral actions such as sending a transaction.

See [#1](https://github.com/open-web3-stack/guardian/issues/1) for spec and example.

## [Guardian CLI](packages/guardian-cli)

## [Guardian Examples](packages/example-guardian)

## [Documentation](packages/guardian/docs)

## Web3 Foundation Grant Project
`Guardian` is part of the bigger `Open-Web3-Stack` initiative, that is currently under a General Grant from Web3 Foundation. See Application details [here](https://github.com/open-web3-stack/General-Grants-Program/blob/master/grants/speculative/open_web3_stack.md). The 1st milestone has been delivered. 

## Projects Using Guardian
If you intend or are using Guardian, please add yourself to the list [here](https://github.com/open-web3-stack/guardian/edit/master/README.md). 
- [Acala](https://github.com/AcalaNetwork)
- [Laminar](https://github.com/laminar-protocol)


