import { TypeRegistry } from '@polkadot/types';
import { getEventParams } from '../../helpers';

describe('substrate helpers', () => {
  const event = new TypeRegistry().createType('Event');
  event.set('data', {
    meta: {
      docs: ['hello world', 'Transfer amount. \\[sender, receiver, amount\\]']
    }
  } as any);

  it('getEventParams', () => {
    const params = getEventParams(event);
    expect(params).toStrictEqual(['sender', 'receiver', 'amount']);
  });

  it('getEventParams fallback', () => {
    event.set('data', {
      meta: {
        docs: ['Transfer amount. [sender, receiver, amount]']
      }
    } as any);
    const params = getEventParams(event);
    expect(params).toStrictEqual(['sender', 'receiver', 'amount']);
  });
});
