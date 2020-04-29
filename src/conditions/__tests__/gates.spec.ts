import { and, or, parse } from '../gates';

describe('gates', () => {
  it('and works', () => {
    expect(and(true, false)({})).toBe(false);
    expect(and(true, true)({})).toBe(true);
    expect(and(false, true)({})).toBe(false);
    expect(and(false, false)({})).toBe(false);
    expect(and(false, false, true)({})).toBe(false);
    expect(and(true, true, () => true)({})).toBe(true);
  });

  it('or works', () => {
    expect(or(true, false)({})).toBe(true);
    expect(or(true, true)({})).toBe(true);
    expect(or(false, true)({})).toBe(true);
    expect(or(false, false)({})).toBe(false);
    expect(or(false, false, true)({})).toBe(true);
    expect(or(false, false, () => true)({})).toBe(true);
  });

  it('parse works', () => {
    expect(parse('a', '< 1.1')({ a: '1.0' })).toBe(true);
    expect(parse('a', '< 1.1')({ a: '1.2' })).toBe(false);

    expect(parse('a', '> 1.1')({ a: '1.2' })).toBe(true);
    expect(parse('a', '> 1.1')({ a: '1.0' })).toBe(false);

    expect(parse('a', '<= 1.1')({ a: '1.1' })).toBe(true);
    expect(parse('a', '<= 1.1')({ a: '1.2' })).toBe(false);

    expect(parse('a', '>= 1.1')({ a: '1.1' })).toBe(true);
    expect(parse('a', '>= 1.1')({ a: '1.0' })).toBe(false);

    expect(parse('a', '== 1.1')({ a: '1.1' })).toBe(true);
    expect(parse('a', '== 1.1')({ a: '1.2' })).toBe(false);

    expect(parse('a', '!= 1.1')({ a: '1.2' })).toBe(true);
    expect(parse('a', '!= 1.1')({ a: '1.1' })).toBe(false);
  });

  it('condition works', () => {
    const expr = and(parse('a', '> 1.0'), or(or(parse('b', '< 0.5'), parse('b', '> 1.0')), parse('c.d', '> 20')));

    expect(expr({ a: 1.2, b: 0.4, c: { d: 10 } })).toBe(true);
    expect(expr({ a: 1.2, b: 1.1, c: { d: 10 } })).toBe(true);
    expect(expr({ a: 1.2, b: 0.2, c: { d: 10 } })).toBe(true);

    expect(expr({ a: 1.0, b: 0.4, c: { d: 30 } })).toBe(false);
  });
});
