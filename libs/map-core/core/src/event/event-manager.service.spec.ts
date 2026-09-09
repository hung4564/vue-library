import mitt from 'mitt';
import { describe, expect, it, vi } from 'vitest';
import type { MapEventStore } from './types';
import { MittTypeMapEventEventKey as EventKey } from './types';
import { EventManager, normalizeEventFrom } from './event-manager.service';

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
});
