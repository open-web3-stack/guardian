import bn from 'big.js';
import { get, isFunction } from 'lodash';

export const and = (...args: (boolean | Function)[]) => (input: any): boolean => {
  return args.reduce((acc, item) => {
    if (isFunction(item)) {
      return acc && item(input);
    } else {
      return acc && item;
    }
  }, true);
};

export const or = (...args: (boolean | Function)[]) => (input: any): boolean => {
  return args.reduce((acc, item) => {
    if (isFunction(item)) {
      return acc || item(input);
    } else {
      return acc || item;
    }
  }, false);
};

const regex = /^\s*(?<op>=|!=|==|<|<=|>|>=)\s*(?<val>\$?\s*-?\s*\d[\d_\s]*(\.[\d\s]+)?\s*%?)\s*$/;

export const parse = (prop: string, condition: string) => (input: any): boolean => {
  const result = regex.exec(condition);
  if (!result) {
    return get(input, prop) == condition;
  }

  const op = result.groups.op;
  let val = result.groups.val;
  if (!op || !val) return false;

  const isPercentage = /\d+(\.\d+)?%/;
  if (isPercentage.test(val)) {
    const numberStr = val.replace('%', '');
    val = bn(numberStr).div(100).toString();
  }

  const expr = `${get(input, prop)} ${op} ${val}`;

  return eval(expr);
};
