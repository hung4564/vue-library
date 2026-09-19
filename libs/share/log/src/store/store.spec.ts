import { describe, expect, it, vi } from 'vitest';
import { DataStoreLogAdapter } from './data-store-adapter';
import { IndexedDBLogDataStore } from './indexeddb-store';
import { MemoryLogDataStore } from './memory-store';
import { NoopLogDataStore } from './noop-store';
import type { LogRecord } from '../types';

function rec(
  id: string,
  partial: Partial<LogRecord['header']> & { level?: LogRecord['header']['level'] } = {},
): LogRecord {
  return {
    id,
    header: {
      ts: partial.ts ?? 1,
      level: partial.level ?? 'info',
      namespaces: partial.namespaces ?? ['demo'],
      ...partial,
    },
    args: ['x'],
  };
}

describe('LogDataStore', () => {
  it('NoopLogDataStore keeps nothing', () => {
    const store = new NoopLogDataStore();
    store.append(rec('a'));
    expect(store.getAll()).toEqual([]);
    expect(store.list({ search: 'x' })).toEqual([]);
  });

  it('MemoryLogDataStore caps at limit and lists', () => {
    const store = new MemoryLogDataStore({ limit: 2 });
    store.append(rec('1', { ts: 1 }));
    store.append(rec('2', { ts: 2, actionId: 'act' }));
    store.append(rec('3', { ts: 3 }));
    expect(store.getAll().map((r) => r.id)).toEqual(['3', '2']);
    expect(store.list({ actionId: 'act' }).map((r) => r.id)).toEqual(['2']);
    expect(store.list({ namespace: 'demo' })).toHaveLength(2);
  });

  it('IndexedDBLogDataStore lists via matchLogRecords (memory fallback in Node)', async () => {
    const store = new IndexedDBLogDataStore();
    await store.append(rec('1', { ts: 1, namespaces: ['a'] }));
    await store.append(rec('2', { ts: 2, actionId: 'act', namespaces: ['b'] }));
    await store.append(rec('3', { ts: 3, level: 'warn', namespaces: ['b'] }));
    const byAction = await store.list({ actionId: 'act' });
    expect(byAction.map((r) => r.id)).toEqual(['2']);
    const byNs = await store.list({ namespace: 'b' });
    expect(byNs.map((r) => r.id)).toEqual(['3', '2']);
    const byLevel = await store.list({ level: 'warn' });
    expect(byLevel.map((r) => r.id)).toEqual(['3']);
  });

  it('DataStoreLogAdapter writes into store', () => {
    const store = new MemoryLogDataStore();
    const adapter = new DataStoreLogAdapter(store);
    adapter.log(rec('z'));
    expect(store.getAll()[0]?.id).toBe('z');
  });

  it('MemoryLogDataStore notifies subscribers', () => {
    const store = new MemoryLogDataStore();
    const spy = vi.fn();
    const unsub = store.subscribe(spy);
    store.append(rec('n'));
    expect(spy).toHaveBeenCalledOnce();
    unsub();
    store.append(rec('m'));
    expect(spy).toHaveBeenCalledOnce();
  });
});
