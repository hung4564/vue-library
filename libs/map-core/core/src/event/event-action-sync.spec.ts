import { describe, expect, it, vi } from 'vitest';

import type { MapSimple } from '../types';
import { createEventActionSync } from './event-action-sync';
import type { IEvent } from './model/Event';

function makeEvent(id: string, event_map_type: string): IEvent {
  return {
    id,
    event_map_type,
    addToMap: vi.fn(),
    removeFromMap: vi.fn(),
  } as unknown as IEvent;
}

describe('createEventActionSync', () => {
  it('adds first event per map type and persists current', () => {
    const map = { id: 'm1' } as MapSimple;
    const setCurrent = vi.fn();
    const sync = createEventActionSync({
      callMap: (cb) => cb(map),
      setCurrent,
    });
    const a = makeEvent('a', 'click');
    sync.updateEventMap([a]);
    expect(a.addToMap).toHaveBeenCalledWith(map);
    expect(setCurrent).toHaveBeenCalledWith('click', a);
  });

  it('swaps when a different event wins the same type', () => {
    const map = { id: 'm1' } as MapSimple;
    const setCurrent = vi.fn();
    const sync = createEventActionSync({
      callMap: (cb) => cb(map),
      setCurrent,
    });
    const a = makeEvent('a', 'click');
    const b = makeEvent('b', 'click');
    sync.updateEventMap([a]);
    sync.updateEventMap([b]);
    expect(a.removeFromMap).toHaveBeenCalledWith(map);
    expect(b.addToMap).toHaveBeenCalledWith(map);
    expect(setCurrent).toHaveBeenLastCalledWith('click', b);
  });

  it('removes listeners when type disappears', () => {
    const map = { id: 'm1' } as MapSimple;
    const setCurrent = vi.fn();
    const sync = createEventActionSync({
      callMap: (cb) => cb(map),
      setCurrent,
    });
    const a = makeEvent('a', 'click');
    sync.updateEventMap([a]);
    sync.updateEventMap([]);
    expect(a.removeFromMap).toHaveBeenCalledWith(map);
    expect(setCurrent).toHaveBeenLastCalledWith('click', undefined);
  });
});
