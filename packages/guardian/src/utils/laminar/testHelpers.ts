import assert from 'assert';
import { TypeRegistry, Metadata, StorageKey } from '@polkadot/types';
import { createFunction } from '@polkadot/types/metadata/decorate/storage/createFunction';
import { types } from '@laminar/types';
import metadataLatest from '@laminar/types/metadata/static-latest';
import { customTypes } from '../../customTypes';

const registry = new TypeRegistry();
registry.register(types);
registry.register(customTypes);

const metadata = new Metadata(registry, metadataLatest);
registry.setMetadata(metadata);

const storageKeyMaker = (section: string, method: string): ((...keys: any[]) => StorageKey) => {
  const pallet = metadata.asLatest.pallets.filter((x) => x.name.toString() === section)[0];
  assert(pallet);
  const meta = pallet.storage.unwrap().items.filter((x) => x.name.toString() === method)[0];
  assert(meta);

  const storageFn = createFunction(
    registry,
    {
      meta,
      prefix: section.slice(0, 1).toLowerCase() + section.slice(1),
      section,
      method
    },
    {}
  );

  return (...keys: any[]): StorageKey => new StorageKey(registry, [storageFn, keys]);
};

export { registry, storageKeyMaker };
