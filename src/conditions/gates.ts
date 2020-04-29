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

  let { op, val } = result.groups;
  if (!op || !val) return false;

  const isPercentage = /\d+(?:\\.\\d+)?%/;
  if (isPercentage.exec(val)) {
    const numberStr = val.replace('%', '');
    val = Number(Number.parseFloat(numberStr) / 100.0).toString();
  }

  const expr = `${get(input, prop)} ${op} ${val}`;

  return eval(expr);
};
