process.env.MARGIN = '0.05';
process.env.BIDDER_SURI = '//Charlie';
process.env.BIDDER_ADDRESS = '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y';
process.env.NODE_ENDPOINT = 'ws://localhost:9944'; //'wss://testnet-node-1.acala.laminar.one/ws';

import run from '.';
run();
