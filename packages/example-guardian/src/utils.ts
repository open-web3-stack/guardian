import path from 'path';
import { defaultLogger } from '@open-web3/util';

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

export const logger = defaultLogger.createLogger('@open-web3/example-guardian');
