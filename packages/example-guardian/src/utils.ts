import { BigSource } from 'big.js';

export const dollar = (value: BigSource) => Big(1e18).mul(value);
