import readConfig from '../read-config';

describe('read-config', () => {
  it('works', () => {
    process.env = { a: '1' };
    const config = readConfig('./bin/__tests__/test.yaml');
    expect(config).toMatchObject({ foo: 1 });
  });
});
