jest.mock('@polkadot/api');

import { TypeRegistry } from '@polkadot/types';
import { types } from '@laminar/types';
import { customTypes } from '../../customTypes';
import { ApiPromise } from '@polkadot/api';

const register = new TypeRegistry();
register.register(types);
register.register(customTypes);

const MockApiPromise = {
  runtimeMetadata: { asLatest: { modules: [] } },
};

// @ts-ignore
ApiPromise.create.mockImplementation(async () => MockApiPromise);
