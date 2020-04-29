import { and, or, parse } from './gates';

const conditionBuilder = (conditions: any[], gate: Function = or) => (input: any): boolean => {
  const expr = gate(
    ...conditions.map((item) => {
      const [key] = Object.keys(item);
      const value = item[key] as any[] | any;
      switch (key) {
        case '$and':
          return conditionBuilder(value, and);
        case '$or':
          return conditionBuilder(value, or);
        default:
          return parse(key, value);
      }
    })
  );

  return expr(input);
};

export default conditionBuilder;
