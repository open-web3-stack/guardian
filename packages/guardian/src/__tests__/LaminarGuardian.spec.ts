import path from 'path';
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
            { method: 'script', path: path.resolve(__dirname, 'test.sh') },
            { method: 'POST', url: 'localhost' },
          ],
        },
      },
    };
    expect(new LaminarGuardian('laminar-chain-guardian', config)).toBeInstanceOf(LaminarGuardian);
  });

  it('throws', async () => {
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
            { method: 'script', path: path.resolve(__dirname, 'test.sh') },
            { method: 'POST', url: 'localhost' },
          ],
        },
      },
    };
    const guardian = new LaminarGuardian('laminar-chain-guardian', config);
    expect.assertions(1);
    await expect(guardian.start()).rejects.toEqual(Error('Guardian [laminar-chain-guardian] cannot find task []'));
  });
});
