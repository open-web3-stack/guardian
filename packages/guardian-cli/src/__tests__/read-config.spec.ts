import * as path from 'path';
import readConfig from '../read-config';

describe('read-config', () => {
  it('works', () => {
    process.env = { a: '1' };
    const config = readConfig(path.resolve(__dirname, 'test.yaml'));
    expect(config).toMatchObject({ foo: 1 });
  });
});
