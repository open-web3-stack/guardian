import AcalaGuardian from '../AcalaGuardian';
import { AcalaGuardianConfig } from '../../types';

const config: AcalaGuardianConfig = {
  chain: 'acala',
  network: 'dev',
  nodeEndpoint: 'ws://localhost:9944',
  monitors: []
};

describe('AcalaGuardian', () => {
  const guardian = new AcalaGuardian(config);

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

  it('should have metadata', () => {
    expect(guardian.metadata).toMatchObject({
      chain: 'acala',
      network: 'dev',
      nodeEndpoint: 'ws://localhost:9944'
    });
  });
});
