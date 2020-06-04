export const nodeEndpoint = process.env.NODE_ENDPOINT || 'ws://localhost:9944';

export const address = process.env.ADDRESS; // '5GHYezbSCbiJcU1iCwN2YMnSMohDSZdudfZyEAYGneyx4xp3'

export const uri = process.env.URI; // //Charlie

export const margin = process.env.MARGIN; // 0.05

if (!address) throw Error('process.env.ADDRESS is missing');
if (!uri) throw Error('process.env.URI is missing');
if (!margin) throw Error('process.env.MARGIN is missing');
