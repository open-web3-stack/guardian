import LaminarGuardian from './LaminarGuardian';
import EthereumGuardian from './EthereumGuardian';
import AcalaGuardian from './AcalaGuardian';
import SubstrateGuardian from './SubstrateGuardian';
import { GuardianConfig } from '../types';
import Guardian from './Guardian';

export interface GuardianConstructor {
  new (name: string, config: GuardianConfig): Guardian;
}

/**
 * Guardian registry used for registring and creating guardian instances.
 *
 * @export
 * @class GuardianRegistry
 */
export default class GuardianRegistry {
  private static guardians = {
    ethereum: EthereumGuardian,
    laminarChain: LaminarGuardian,
    acalaChain: AcalaGuardian,
    substrateChain: SubstrateGuardian
  };

  /**
   * Register a guardian class
   *
   * @static
   * @param {string} networkType
   * @param {GuardianConstructor} guardian
   * @memberof GuardianRegistry
   */
  public static register(networkType: string, guardian: GuardianConstructor) {
    if (networkType.length === 0) {
      throw Error('networkType is not defined!');
    }

    if (GuardianRegistry.get(networkType)) {
      throw Error(`Guardian [${networkType}] is already registered!`);
    }

    GuardianRegistry.guardians[networkType] = guardian;
  }

  /**
   * Get guardian class for networkType
   *
   * @static
   * @param {string} networkType
   * @returns {(GuardianConstructor | undefined)}
   * @memberof GuardianRegistry
   */
  public static get(networkType: string): GuardianConstructor | undefined {
    return GuardianRegistry.guardians[networkType];
  }

  /**
   * Create guardian instance
   *
   * @static
   * @param {string} networkType
   * @param {string} guardianName
   * @param {GuardianConfig} config
   * @returns {Guardian}
   * @memberof GuardianRegistry
   */
  public static create(networkType: string, guardianName: string, config: GuardianConfig): Guardian {
    const GuardianClass = GuardianRegistry.get(networkType);
    if (!GuardianClass) {
      throw Error(`Guardian [${networkType}] not found!`);
    }

    return new GuardianClass(guardianName, config);
  }
}
