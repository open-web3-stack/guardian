import { TypeRegistry } from '@polkadot/types';
import { Event } from '@polkadot/types/interfaces';
import { getEventParams } from '../../helpers';

describe('substrate helpers', () => {
  const registry = new TypeRegistry();
  const event = registry.createType<Event>('Event');
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

  it('getEventParams from fields', () => {
    event.set('data', {
      meta: {
        fields: [
          registry.createType('Si1Field', { name: 'sender' }),
          registry.createType('Si1Field', { name: 'receiver' }),
          registry.createType('Si1Field', { name: 'amount' })
        ],
        docs: ['Transfer amount.']
      }
    } as any);
    const params = getEventParams(event);
    expect(params).toStrictEqual(['sender', 'receiver', 'amount']);
  });
});
