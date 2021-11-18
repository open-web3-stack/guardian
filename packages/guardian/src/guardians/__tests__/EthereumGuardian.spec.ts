import EthereumGuardian from '../EthereumGuardian';
import { EthereumGuardianConfig } from '../../types';

const config: EthereumGuardianConfig = {
  chain: 'ethereum',
  network: 'dev',
  nodeEndpoint: 'http://localhost:8545',
  monitors: {}
};

describe('EthereumGuardian', () => {
  const guardian = new EthereumGuardian(config);

  it('should work', () => {
    const { error, value } = guardian.validationSchema().validate({ ...config }, { allowUnknown: true });
    expect(error).toBeUndefined();
    expect(value).toStrictEqual(config);
  });

  it('should replace default values', () => {
    const { error, value } = guardian
      .validationSchema()
      .validate({ ...config, nodeEndpoint: undefined }, { allowUnknown: true });
    expect(error).toBeUndefined();
    expect(value).toStrictEqual(config);
  });

  it('should throw', () => {
    const { error } = guardian
      .validationSchema()
      .validate({ ...config, network: 'mainnet', nodeEndpoint: undefined }, { allowUnknown: true });
    expect(error).toBeTruthy();
  });
});
