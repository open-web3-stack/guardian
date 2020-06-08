export const nodeEndpoint = process.env.NODE_ENDPOINT || 'ws://localhost:9944';

export const bidder_address = process.env.BIDDER_ADDRESS; // '5GHYezbSCbiJcU1iCwN2YMnSMohDSZdudfZyEAYGneyx4xp3'

export const bidder_suri = process.env.BIDDER_SURI; // //Charlie

export const margin = process.env.MARGIN; // 0.05

if (!bidder_address) throw Error('process.env.BIDDER_ADDRESS is missing');
if (!bidder_suri) throw Error('process.env.BIDDER_SURI is missing');
if (!margin) throw Error('process.env.MARGIN is missing');
