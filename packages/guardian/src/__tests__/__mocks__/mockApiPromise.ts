jest.mock('@polkadot/api');

import { TypeRegistry } from '@polkadot/types';
import { types } from '@laminar/types';
import { customTypes } from '../../customTypes';
import { ApiPromise } from '@polkadot/api';

const register = new TypeRegistry();
register.register(types);
register.register(customTypes);

const tokenSymbol = [
  'ACA',
  'AUSD',
  'DOT',
  'LDOT',
  'XBTC',
  'RENBTC',
  'KAR',
  'KUSD',
  'KSM',
  'LKSM'
];

const tokenDecimals = [
  13,
  12,
  10,
  10,
  8,
  8,
  12,
  12,
  12,
  12
];

export const MockApiPromise = {
  runtimeMetadata: { asLatest: { modules: [] } },
  rpc: { system: { properties: () => {
    return register.createType('ChainProperties', { tokenSymbol, tokenDecimals });
  }}}
};

// @ts-ignore
ApiPromise.create.mockImplementation(async () => MockApiPromise);
