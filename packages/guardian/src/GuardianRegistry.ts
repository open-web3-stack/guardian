import SubstrateGuardian from './SubstrateGuardian';
import { GuardianConfig } from './types';
import Guardian from './Guardian';

export interface GuardianConstructor {
  new (config: GuardianConfig): Guardian;
}

/**
 * Guardian registry used for registring and creating guardian instances.
 *
 * @export
 * @class GuardianRegistry
 */
export default class GuardianRegistry {
  private static guardians = {
    substrate: SubstrateGuardian
  };

  public static registred() {
    return Object.keys(GuardianRegistry.guardians);
  }

  /**
   * Register a guardian class
   *
   * @static
   * @param {string} chain
   * @param {GuardianConstructor} guardian
   * @memberof GuardianRegistry
   */
  public static register<T extends GuardianConstructor>(chain: string, guardian: T) {
    if (chain.length === 0) {
      throw Error('chain is not defined!');
    }

    if (GuardianRegistry.get(chain)) {
      throw Error(`Guardian [${chain}] is already registered!`);
    }

    GuardianRegistry.guardians[chain] = guardian;
  }

  /**
   * Get guardian class for chain
   *
   * @static
   * @param {string} chain
   * @returns {(GuardianConstructor | undefined)}
   * @memberof GuardianRegistry
   */
  public static get(chain: string): GuardianConstructor | undefined {
    return GuardianRegistry.guardians[chain];
  }

  /**
   * Create guardian instance
   *
   * @static
   * @param {GuardianConfig} config
   * @returns {Guardian}
   * @memberof GuardianRegistry
   */
  public static create(config: GuardianConfig): Guardian {
    const GuardianClass = GuardianRegistry.get(config.chain);
    if (!GuardianClass) {
      throw Error(`Guardian [${config.chain}] not found!`);
    }

    return new GuardianClass(config);
  }
}
