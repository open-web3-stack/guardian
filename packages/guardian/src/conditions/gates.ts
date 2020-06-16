import BN from 'big.js';
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

// eslint-disable-next-line
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
  let num = result.groups?.num;
  if (op && num) {
    const isPercentage = /\d+(\.\d+)?%/;
    if (isPercentage.test(num)) {
      const numberStr = num.replace('%', '');
      num = BN(numberStr).div(100).toFixed();
    }

    const expr = `${lhs} ${op} ${num}`;

    return eval(expr); // eslint-disable-line
  }

  // strings
  const { cond, str } = result.groups as any;
  if (cond && str) {
    switch (cond) {
      case 'eq':
        return lhs === str;
      case 'ne':
        return lhs !== str;
      default:
        return false;
    }
  }

  return false;
};
