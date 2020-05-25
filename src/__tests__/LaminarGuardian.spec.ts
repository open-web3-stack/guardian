import { LaminarGuardian } from '../guardians';
import { LaminarGuardianConfig } from '../types';

describe('LaminarGuardian', () => {
  it('works', () => {
    const config: LaminarGuardianConfig = {
      networkType: 'laminarChain',
      network: 'dev',
      nodeEndpoint: 'ws://localhost:9944',
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
    expect(new LaminarGuardian('laminar-chain-guardian', config)).toBeInstanceOf(LaminarGuardian);
  });

  it('throws', () => {
    const config: LaminarGuardianConfig = {
      networkType: 'laminarChain',
      network: 'dev',
      nodeEndpoint: 'ws://localhost:9944',
      confirmation: 'finalize',
      monitors: {
        'margin-monitor': {
          task: '', // will throw
          arguments: { poolId: 1 },
          actions: [
            { method: 'script', path: './src/__tests__/test.sh' },
            { method: 'POST', url: 'localhost' },
          ],
        },
      },
    };
    expect(() => new LaminarGuardian('laminar-chain-guardian', config)).toThrow(Error);
  });
});
