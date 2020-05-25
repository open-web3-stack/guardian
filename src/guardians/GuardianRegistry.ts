import Guardian from './Guardian';
import { GuardianConfig } from '../types';

interface GuardianConstructor {
  new (name: string, config: GuardianConfig): Guardian;
}

export default class GuardianRegistry {
  private static guardians: { [key: string]: GuardianConstructor } = {};

  public static register(networkType: string, guardian: GuardianConstructor) {
    if (networkType.length === 0) {
      throw Error('networkType is not defined!');
    }

    if (GuardianRegistry.get(networkType)) {
      throw Error(`Guardian [${networkType}] is already registered!`);
    }

    GuardianRegistry.guardians[networkType] = guardian;
  }

  public static get(networkType: string): GuardianConstructor {
    return GuardianRegistry.guardians[networkType];
  }

  public static create(networkType: string, guardianName: string, config: GuardianConfig): Guardian {
    const GuardianClass = GuardianRegistry.get(networkType);
    if (!GuardianClass) {
      throw Error(`Guardian [${networkType}] not found!`);
    }

    return new GuardianClass(guardianName, config);
  }
}
