import Big from 'big.js';
import { get, isFunction } from 'lodash';

export const and = (...args: (boolean | Function)[]) => (input: any) => {
  return args.reduce((acc, item) => {
    if (isFunction(item)) {
      return acc && item(input);
    } else {
      return acc && item;
    }
  }, true);
};

export const or = (...args: (boolean | Function)[]) => (input: any) => {
  return args.reduce((acc, item) => {
    if (isFunction(item)) {
      return acc || item(input);
    } else {
      return acc || item;
    }
  }, false);
};

const regex = /^\s*(?<op>!=|==|<|<=|>|>=)\s*(?<num>\$?\s*-?\s*\d[\d_\s]*(\.[\d\s]+)?\s*%?)\s*$|^\s*(?<cond>ne|eq)\s*(?<str>\$?\b\w*)\s*$/;

export const parse = (prop: string, condition: string) => (input: any): boolean => {
  const lhs = get(input, prop);

  const result = regex.exec(condition);
  // do a simple comparison
  if (!result) {
    return lhs == condition; // eslint-disable-line
  }

  // numbers
  const op = result.groups?.op;
  let rhs = result.groups?.num;
  if (op && rhs) {
    const isPercentage = /\d+(\.\d+)?%/;
    if (isPercentage.test(rhs)) {
      const numberStr = rhs.replace('%', '');
      rhs = Big(numberStr).div(100).toFixed();
    }

    const value = Big(lhs);

    switch (op) {
      case '==':
        return value.eq(rhs);
      case '!=':
        return !value.eq(rhs);
      case '>':
        return value.gt(rhs);
      case '>=':
        return value.gte(rhs);
      case '<':
        return value.lt(rhs);
      case '<=':
        return value.lte(rhs);
      default:
        return false;
    }
  }

  // strings
  const cond = result.groups?.cond;
  rhs = result.groups?.str;
  if (cond && rhs) {
    switch (cond) {
      case 'eq':
        return String(lhs) === rhs;
      case 'ne':
        return String(lhs) !== rhs;
      default:
        return false;
    }
  }

  return false;
};
