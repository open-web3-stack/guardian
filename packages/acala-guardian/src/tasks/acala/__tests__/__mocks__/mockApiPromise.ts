import { of } from 'rxjs';
import { TypeRegistry } from '@polkadot/types';
import { types } from '@acala-network/types';
import { customTypes } from '../../../../customTypes';

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
