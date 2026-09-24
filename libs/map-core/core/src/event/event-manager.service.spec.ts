import mitt from 'mitt';
import { describe, expect, it, vi } from 'vitest';

import { EventManager, normalizeEventFrom } from './event-manager.service';
import type { MapEventStore } from './types';
import { MittTypeMapEventEventKey as EventKey } from './types';

describe('normalizeEventFrom', () => {
  it('converts camelCase / spaces / underscores to kebab-case', () => {
    expect(normalizeEventFrom('MeasureDistance')).toBe('measure-distance');
    expect(normalizeEventFrom('XMLParser')).toBe('xml-parser');
    expect(normalizeEventFrom('foo_bar baz')).toBe('foo-bar-baz');
  });
});

describe('EventManager', () => {
  function create() {
    const store: MapEventStore = { items: [], current: {} };
    const emitter = mitt();
    const manager = new EventManager('m1', store, emitter as any);
    return { store, emitter, manager };
  }

  it('add prepends item, normalizes from, and emits', () => {
    const { store, emitter, manager } = create();
    const onAdd = vi.fn();
    const onItems = vi.fn();
    emitter.on(EventKey.add, onAdd);
    emitter.on(EventKey.setItems, onItems);

    manager.add({ id: 'e1', from: 'MyComponent' } as any);
    expect(store.items[0].from).toBe('my-component');
    expect(onAdd).toHaveBeenCalled();
    expect(onItems).toHaveBeenCalledWith(store.items);
  });

  it('remove and setCurrent update store and emit', () => {
    const { store, emitter, manager } = create();
    const event = { id: 'e1' } as any;
    manager.add(event);
    manager.setCurrent(event);
    expect(manager.getCurrent()).toEqual(event);
    expect(manager.isActive('e1')).toBe(true);

    const onRemove = vi.fn();
    emitter.on(EventKey.remove, onRemove);
    manager.remove(event);
    expect(store.items).toHaveLength(0);
    expect(onRemove).toHaveBeenCalledWith(event);

    manager.setCurrent(undefined, 'e1');
    expect(manager.getCurrent('e1')).toBeUndefined();
    expect(manager.getCurrent()).toBeUndefined();
  });

  it('logs add/remove with event identity and remove outcome', () => {
    const store: MapEventStore = { items: [], current: {} };
    const emitter = mitt();
    const log = vi.fn();
    const manager = new EventManager('m1', store, emitter as any, log);
    const event = {
      id: 'e1',
      event_map_type: 'click',
      type_select: 'map',
      from: 'IdentifyControl',
      name: 'identify',
    } as any;

    manager.add(event, 'IdentifyControl');
    expect(log.mock.calls[0][2]).toContain('add click (map)');
    expect(log.mock.calls[0][2]).toContain('from=identify-control');
    expect(log.mock.calls[0][2]).toContain('id=e1');
    expect(log.mock.calls[0][3].event).toMatchObject({
      id: 'e1',
      event_map_type: 'click',
      from: 'identify-control',
    });

    manager.remove(event);
    expect(log.mock.calls[1][2]).toContain('remove click (map)');
    expect(log.mock.calls[1][2]).toContain('removed remaining=0');
    expect(log.mock.calls[1][3]).toMatchObject({ removed: true, remaining: 0 });

    manager.remove(event);
    expect(log.mock.calls[2][2]).toContain('skipped (not in store)');
    expect(log.mock.calls[2][3]).toMatchObject({ removed: false });
  });
});
