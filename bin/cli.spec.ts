import fs from 'fs';
import yaml from 'js-yaml';

describe('cli', () => {
  it('yaml load works', () => {
    const config = yaml.safeLoad(fs.readFileSync('./src/__tests__/config.yaml', 'utf8'));
    expect(config).toMatchObject({ version: '0.1' });
  });
});
