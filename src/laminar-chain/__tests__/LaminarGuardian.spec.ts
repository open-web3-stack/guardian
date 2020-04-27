import LaminarGuardian from '../LaminarGuardian';
import { LaminarGuardianConfig } from '../../types';

describe('LaminarGuardian', () => {
  it('works', () => {
    const config: LaminarGuardianConfig = {
      nodeEndpoint: 'ws://localhost:9944',
      network: 'dev',
      confirmation: 'finalize',
      monitors: {
        'margin-monitor': {
          task: 'margin.poolInfo',
          arguments: { poolId: 1 },
          actions: [
            { method: 'script', path: './src/__tests__/test.sh' },
            { method: 'POST', url: 'localhost' },
          ],
        },
      },
    };
    expect(new LaminarGuardian(config)).toBeTruthy();
  });

  it('throws', () => {
    const config: LaminarGuardianConfig = {
      nodeEndpoint: 'ws://localhost:9944',
      network: 'dev',
      confirmation: 'finalize',
      monitors: {
        'margin-monitor': {
          task: '',
          arguments: { poolId: 1 },
          actions: [
            { method: 'script', path: './src/__tests__/test.sh' },
            { method: 'POST', url: 'localhost' },
          ],
        },
      },
    };
    expect(() => new LaminarGuardian(config)).toThrow(Error);
  });
});
