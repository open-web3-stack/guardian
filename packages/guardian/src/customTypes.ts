import { i128, u128, u64 } from '@polkadot/types/primitive';

class FixedI128 extends i128 {
  toHuman() {
    return this.toString(10);
  }

  toJSON() {
    return this.toString(10);
  }
}

class Balance extends u128 {
  toHuman() {
    return this.toString(10);
  }

  toJSON() {
    return this.toString(10);
  }
}

export const customTypes = { FixedI128, Balance, TransactionPriority: u64 };
