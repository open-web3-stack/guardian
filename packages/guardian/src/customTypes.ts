import { i128, u128 } from '@polkadot/types/primitive';

class FixedI128 extends i128 {
  toJSON() {
    return this.toString(10);
  }
}

class Balance extends u128 {
  toJSON() {
    return this.toString(10);
  }
}

export const customTypes = { FixedI128, Balance };
