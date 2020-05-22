import Guardian from './Guardian';
import { GuardianConfig, NetworkType } from '../types';

interface GuardianConstructor {
  new (name: string, config: GuardianConfig): Guardian;
}

export default class GuardianRegistry {
  private static guardians: { [key: string]: GuardianConstructor } = {};

  public static register(name: NetworkType | string, guardian: GuardianConstructor) {
    if (name.length === 0) {
      throw Error('name is not defined!');
    }

    if (GuardianRegistry.get(name)) {
      throw Error(`Guardian [${name}] is already registered!`);
    }

    GuardianRegistry.guardians[name] = guardian;
  }

  public static get(name: string): GuardianConstructor {
    return GuardianRegistry.guardians[name];
  }

  public static create(name: NetworkType | string, guardianName: string, config: GuardianConfig): Guardian {
    const GuardianClass = GuardianRegistry.get(name);
    if (!GuardianClass) {
      throw Error(`Guardian [${name}] not found!`);
    }

    return new GuardianClass(guardianName, config);
  }
}
