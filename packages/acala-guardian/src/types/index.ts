import { BaseSubstrateGuardianConfig } from '@open-web3/guardian/src/types';
import { acalaNetwork } from '../constants';
export * from './output';

export interface AcalaGuardianConfig extends BaseSubstrateGuardianConfig {
  network: typeof acalaNetwork[number];
}
