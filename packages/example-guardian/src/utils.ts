import Big, { BigSource } from 'big.js';
import path from 'path';

export const dollar = (value: BigSource) => Big(1e18).mul(value);

/**
 * Set default YAML config file if not specified by option `--config`
 *
 * @param configFile defualt YAML config file
 */
export const setDefaultConfig = (configFile: string) => {
  if (!process.argv.find((i) => i.startsWith('--config'))) {
    process.argv.push('--config');
    process.argv.push(path.resolve(__dirname, configFile));
  }
};
