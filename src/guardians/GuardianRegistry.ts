import Guardian from './Guardian';
import { GuardianConfig, NetworkType } from '../types';

interface GuardianConstructor {
  new (name: string, config: GuardianConfig): Guardian;
}

export default class GuardianRegistry {
  private static guardians: { [key: string]: GuardianConstructor } = {};

  public static register(identifier: NetworkType | string, guardian: GuardianConstructor) {
    if (identifier.length === 0) {
      throw Error('identifier is not defined!');
    }

    if (GuardianRegistry.get(identifier)) {
      throw Error(`Guardian [${identifier}] is already registered!`);
    }

    GuardianRegistry.guardians[identifier] = guardian;
  }

  public static get(identifier: string): GuardianConstructor {
    return GuardianRegistry.guardians[identifier];
  }

  public static create(identifier: NetworkType | string, guardianName: string, config: GuardianConfig): Guardian {
    const GuardianClass = GuardianRegistry.get(identifier);
    if (!GuardianClass) {
      throw Error(`Guardian [${identifier}] not found!`);
    }

    return new GuardianClass(guardianName, config);
  }
}
