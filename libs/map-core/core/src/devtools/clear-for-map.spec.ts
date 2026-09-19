import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryLogDataStore, type LogRecord } from '@hungpvq/shared-log';
import { getMapDebugStore } from './map-debug-store';
import {
  clearDevtoolErrorsForMapId,
  clearDevtoolLogsForMapId,
  getDevtoolState,
  initDevtoolStoreCore,
  replaceDevtoolErrors,
} from './store-core';

function rec(id: string, mapId?: string): LogRecord {
  return {
    id,
    header: {
      level: 'debug',
      ts: Date.now(),
      namespaces: ['map:test'],
      ...(mapId ? { mapId } : {}),
    },
    args: ['msg'],
  } as LogRecord;
}

describe('clearDevtoolLogsForMapId', () => {
  beforeEach(() => {
    const bag = getMapDebugStore();
    bag.logDataStore = undefined;
    bag.logStoreOptions = { kind: 'memory', limit: 100 };
    initDevtoolStoreCore();
  });

  it('no-ops when log store was never created', () => {
    const bag = getMapDebugStore();
    bag.logDataStore = undefined;
    expect(() => clearDevtoolLogsForMapId('m1')).not.toThrow();
    expect(bag.logDataStore).toBeUndefined();
  });

  it('removes only records for that mapId', async () => {
    const store = new MemoryLogDataStore({ limit: 100 });
    getMapDebugStore().logDataStore = store;
    store.append(rec('a', 'map-a'));
    store.append(rec('b', 'map-b'));
    store.append(rec('c', 'map-a'));

    clearDevtoolLogsForMapId('map-a');
    await Promise.resolve();
    await Promise.resolve();

    const left = store.getAll();
    expect(left.map((r) => r.id)).toEqual(['b']);
  });

  it('clears matching error rows', () => {
    replaceDevtoolErrors([
      {
        code: 'A',
        message: 'a',
        context: { mapId: 'map-a' },
        recoverable: true,
        timestamp: 1,
      },
      {
        code: 'B',
        message: 'b',
        context: { mapId: 'map-b' },
        recoverable: true,
        timestamp: 2,
      },
    ]);
    clearDevtoolErrorsForMapId('map-a');
    expect(getDevtoolState().errors.map((e) => e.code)).toEqual(['B']);
  });
});
