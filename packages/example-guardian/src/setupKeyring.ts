import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

export default async (SURI: string, address: string) => {
  await cryptoWaitReady();
  const keyring = new Keyring({ type: 'sr25519' });
  keyring.addFromUri(SURI);

  const signer = keyring.getPair(address);
  return { keyring, signer };
};
