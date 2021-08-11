import path from 'path';
import { defaultLogger } from '@open-web3/util';
import { ApiPromise } from '@polkadot/api';

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

const decimals: Record<string, number> = {};

export const tokenPrecision = async (api: ApiPromise, token: any): Promise<number> => {
  if (Object.keys(decimals).length === 0) {
    const properties = await api.rpc.system.properties();
    const tokenSymbol = properties.tokenSymbol.unwrapOrDefault();
    const tokenDecimals = properties.tokenDecimals.unwrapOrDefault();
    if (tokenSymbol.length !== tokenDecimals.length) {
      throw Error(`Token symbols/decimals mismatch ${tokenSymbol} ${tokenDecimals}`);
    }
    tokenSymbol.forEach((symbol, index) => {
      decimals[symbol.toString()] = tokenDecimals[index].toNumber();
    });
  }
  const precision = decimals[token.toUpperCase()];
  if (!precision) throw Error(`Token "${token}" is not supported`);
  return precision;
};
