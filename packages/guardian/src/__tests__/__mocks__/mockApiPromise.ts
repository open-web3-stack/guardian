import { of } from 'rxjs';
import { TypeRegistry } from '@polkadot/types';
import { types } from '@laminar/types';
import { customTypes } from '../../customTypes';

const registry = new TypeRegistry();
registry.register(types);
registry.register(customTypes);

export const acalaRpc = {
  runtimeMetadata: { asLatest: { modules: [] } },
  rpc: {
    system: {
      properties: () =>
        of(
          registry.createType('ChainProperties', {
            tokenSymbol: ['ACA', 'AUSD', 'DOT', 'LDOT', 'XBTC', 'RENBTC', 'KAR', 'KUSD', 'KSM', 'LKSM'],
            tokenDecimals: [13, 12, 10, 10, 8, 8, 12, 12, 12, 12]
          })
        )
    }
  }
};

export const laminarRpc = {
  runtimeMetadata: { asLatest: { modules: [] } },
  rpc: {
    system: {
      properties: () =>
        of(
          registry.createType('ChainProperties', { tokenSymbol: ['LAMI', 'AUSD', 'FEUR'], tokenDecimals: [18, 18, 18] })
        )
    },
    margin: {
      poolState: jest.fn(() => of(registry.createType('MarginPoolState', { enp: 100, ell: 100 })))
    }
  }
};
