import { type LogRecord, MemoryLogDataStore } from '@hungpvq/shared-log';
import { describe, expect, it } from 'vitest';

import {
  buildRequestFlowSteps,
  buildRequestFlowTree,
  formatFlowDelta,
  type LevelFilter,
} from './log-helpers';
import { displayValue, getValueType, hasChildren } from './tree-helpers';

function entry(
  id: string,
  level: 'debug' | 'info' | 'warn' | 'error',
  namespaces: string[],
  args: unknown[],
  ts = 1,
): LogRecord {
  return {
    id,
    header: { ts, level, namespaces },
    args,
  };
}

function storeOf(records: LogRecord[]) {
  const store = new MemoryLogDataStore({ limit: 10_000 });
  for (const r of [...records].reverse()) store.append(r);
  return store;
}

describe('log-helpers', () => {
  it('store.list by level and search', () => {
    const store = storeOf([
      entry('1', 'info', ['map'], ['hello'], 1),
      entry('2', 'error', ['map'], ['boom'], 2),
    ]);
    const filtered = store.list({
      search: 'boom',
      level: 'error' as LevelFilter,
      namespace: 'all',
      mapId: 'all',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.id).toBe('2');
  });

  it('store.list by root namespace only', () => {
    const store = storeOf([
      entry('1', 'info', ['menu', 'click'], ['a'], 1),
      entry('2', 'info', ['menu', 'other'], ['b'], 2),
      entry('3', 'info', ['map:core', 'store'], ['c'], 3),
    ]);
    const filtered = store.list({
      search: '',
      level: 'all' as LevelFilter,
      namespace: 'menu',
      mapId: 'all',
    });
    expect(filtered.map((l) => l.id)).toEqual(['1', '2']);
  });

  it('store.list by actionId sorts by hierarchical index', () => {
    const store = storeOf([
      {
        id: 'end',
        header: {
          ts: 3,
          index: '2',
          level: 'debug' as const,
          namespaces: ['menu'],
          actionId: 'req-sort',
        },
        args: ['END'],
      },
      {
        id: 'mid',
        header: {
          ts: 2,
          index: '1.1',
          level: 'debug' as const,
          namespaces: ['menu'],
          actionId: 'req-sort',
        },
        args: ['mid'],
      },
      {
        id: 'start',
        header: {
          ts: 1,
          index: '1',
          level: 'debug' as const,
          namespaces: ['menu'],
          actionId: 'req-sort',
        },
        args: ['START'],
      },
    ]);
    const filtered = store.list({
      search: '',
      level: 'all' as LevelFilter,
      namespace: 'all',
      mapId: 'all',
      actionId: 'req-sort',
    });
    expect(filtered.map((l) => l.id)).toEqual(['start', 'mid', 'end']);
  });

  it('store.list by actionId', () => {
    const store = storeOf([
      {
        id: '1',
        header: {
          ts: 1,
          level: 'info' as const,
          namespaces: ['menu'],
          actionId: 'req-aaa',
        },
        args: ['a'],
      },
      {
        id: '2',
        header: {
          ts: 2,
          level: 'info' as const,
          namespaces: ['menu'],
          actionId: 'req-bbb',
        },
        args: ['b'],
      },
    ]);
    const filtered = store.list({
      search: '',
      level: 'all' as LevelFilter,
      namespace: 'all',
      mapId: 'all',
      actionId: 'bbb',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.id).toBe('2');
  });

  it('store.list by actionId (flow) returns all matches sorted by index', () => {
    const store = storeOf([
      {
        id: 'a',
        header: {
          ts: 1,
          index: '1',
          level: 'debug' as const,
          namespaces: ['x'],
          actionId: 'req-f',
          spanId: 'fn-1',
        },
        args: ['START'],
      },
      {
        id: 'b',
        header: {
          ts: 2,
          index: '1.1',
          level: 'debug' as const,
          namespaces: ['x'],
          actionId: 'req-f',
          spanId: 'fn-1',
        },
        args: ['mid'],
      },
      {
        id: 'c',
        header: {
          ts: 3,
          index: '2',
          level: 'debug' as const,
          namespaces: ['y'],
          actionId: 'other',
        },
        args: ['other'],
      },
    ]);
    const matched = store.list({ actionId: 'req-f' });
    expect(matched.map((l) => l.id)).toEqual(['a', 'b']);
  });

  it('store.list by actionId (flow) prefers index over equal ts', () => {
    const store = storeOf([
      {
        id: 'end',
        header: {
          ts: 100,
          index: 3,
          level: 'debug' as const,
          namespaces: ['x'],
          actionId: 'req-i',
          fn: 'work',
          spanId: 'fn-1',
        },
        args: ['END'],
      },
      {
        id: 'start',
        header: {
          ts: 100,
          index: 1,
          level: 'debug' as const,
          namespaces: ['x'],
          actionId: 'req-i',
          fn: 'work',
          spanId: 'fn-1',
        },
        args: ['START'],
      },
      {
        id: 'mid',
        header: {
          ts: 100,
          index: 2,
          level: 'info' as const,
          namespaces: ['x'],
          actionId: 'req-i',
          fn: 'work',
          spanId: 'fn-1',
        },
        args: ['mid'],
      },
    ]);
    const matched = store.list({ actionId: 'req-i' });
    expect(matched.map((l) => l.id)).toEqual(['start', 'mid', 'end']);
    const tree = buildRequestFlowTree(matched);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.children.map((c) => c.label)).toEqual([
      'mid',
      'work · END',
    ]);
  });

  it('buildRequestFlowTree keeps write order when mid arrives after END', () => {
    const store = storeOf([
      {
        id: 's',
        header: {
          ts: 1,
          index: 1,
          level: 'debug' as const,
          namespaces: ['x'],
          actionId: 'req-e',
          fn: 'work',
          spanId: 'fn-1',
          flowKind: 'call' as const,
        },
        args: ['START'],
      },
      {
        id: 'e',
        header: {
          ts: 2,
          index: 2,
          level: 'debug' as const,
          namespaces: ['x'],
          actionId: 'req-e',
          fn: 'work',
          spanId: 'fn-1',
          flowKind: 'call' as const,
        },
        args: ['END'],
      },
      {
        id: 'late',
        header: {
          ts: 3,
          index: 3,
          level: 'info' as const,
          namespaces: ['x'],
          actionId: 'req-e',
          fn: 'work',
          spanId: 'fn-1',
          flowKind: 'call' as const,
        },
        args: ['late-mid'],
      },
    ]);
    const tree = buildRequestFlowTree(store.list({ actionId: 'req-e' }));
    expect(tree[0]!.children.map((c) => c.label)).toEqual([
      'work · END',
      'late-mid',
    ]);
  });

  it('store.list by actionId (flow) is chronological', () => {
    const store = storeOf([
      {
        id: '2',
        header: {
          ts: 200,
          level: 'info' as const,
          namespaces: ['mitt'],
          actionId: 'req-1',
          span: 'emit',
        },
        args: ['b'],
      },
      {
        id: '1',
        header: {
          ts: 100,
          level: 'info' as const,
          namespaces: ['menu'],
          actionId: 'req-1',
          span: 'click',
        },
        args: ['a'],
      },
      {
        id: '3',
        header: {
          ts: 150,
          level: 'info' as const,
          namespaces: ['other'],
          actionId: 'req-other',
        },
        args: ['c'],
      },
    ]);
    const matched = store.list({ actionId: 'req-1' });
    expect(matched.map((l) => l.id)).toEqual(['1', '2']);
    const steps = buildRequestFlowSteps(matched);
    expect(steps.map((s) => s.label)).toEqual(['a', 'b']);
    expect(steps.map((s) => s.span)).toEqual(['click', 'emit']);
    expect(steps[1]!.deltaMs).toBe(100);
    expect(formatFlowDelta(100)).toBe('+100ms');
  });

  it('buildRequestFlowTree nests handlers under emit', () => {
    const store = storeOf([
      {
        id: 'a-start',
        header: {
          ts: 10,
          level: 'debug' as const,
          namespaces: ['menu'],
          actionId: 'req-t',
          fn: 'handleClick',
          span: 'menu.action',
          flowKind: 'call' as const,
          flowDepth: 0,
          spanId: 'fn-a',
        },
        args: ['START'],
      },
      {
        id: 'mid',
        header: {
          ts: 15,
          level: 'debug' as const,
          namespaces: ['menu'],
          actionId: 'req-t',
          fn: 'handleClick',
          span: 'menu.action',
          flowKind: 'call' as const,
          flowDepth: 0,
          spanId: 'fn-a',
        },
        args: ['Context'],
      },
      {
        id: 'emit',
        header: {
          ts: 20,
          level: 'debug' as const,
          namespaces: ['mitt'],
          actionId: 'req-t',
          fn: 'handleClick',
          span: 'menu.action',
          flowKind: 'emit' as const,
          eventName: 'DATASET_UPDATED',
          flowDepth: 1,
          parentFn: 'handleClick',
          spanId: 'fn-a',
        },
        args: ['EMIT'],
      },
      {
        id: 'hb',
        header: {
          ts: 30,
          level: 'debug' as const,
          namespaces: ['mitt'],
          actionId: 'req-t',
          fn: 'onDatasetB',
          span: 'mitt.handler',
          flowKind: 'handler' as const,
          eventName: 'DATASET_UPDATED',
          flowDepth: 1,
          parentFn: 'handleClick',
          spanId: 'fn-b',
        },
        args: ['START'],
      },
      {
        id: 'hb-end',
        header: {
          ts: 35,
          level: 'debug' as const,
          namespaces: ['mitt'],
          actionId: 'req-t',
          fn: 'onDatasetB',
          span: 'mitt.handler',
          flowKind: 'handler' as const,
          eventName: 'DATASET_UPDATED',
          flowDepth: 1,
          spanId: 'fn-b',
        },
        args: ['END'],
      },
      {
        id: 'hc',
        header: {
          ts: 40,
          level: 'debug' as const,
          namespaces: ['mitt'],
          actionId: 'req-t',
          fn: 'onDatasetC',
          span: 'mitt.handler',
          flowKind: 'handler' as const,
          eventName: 'DATASET_UPDATED',
          flowDepth: 1,
          parentFn: 'handleClick',
          spanId: 'fn-c',
        },
        args: ['START'],
      },
      {
        id: 'hc-end',
        header: {
          ts: 45,
          level: 'debug' as const,
          namespaces: ['mitt'],
          actionId: 'req-t',
          fn: 'onDatasetC',
          span: 'mitt.handler',
          flowKind: 'handler' as const,
          eventName: 'DATASET_UPDATED',
          flowDepth: 1,
          spanId: 'fn-c',
        },
        args: ['END'],
      },
      {
        id: 'a-end',
        header: {
          ts: 50,
          level: 'debug' as const,
          namespaces: ['menu'],
          actionId: 'req-t',
          fn: 'handleClick',
          span: 'menu.action',
          flowKind: 'call' as const,
          flowDepth: 0,
          spanId: 'fn-a',
        },
        args: ['END'],
      },
    ]);
    const tree = buildRequestFlowTree(store.list({ actionId: 'req-t' }));
    expect(tree).toHaveLength(1);
    expect(tree[0]!.label).toBe('handleClick · START');
    expect(tree[0]!.children.map((c) => c.label)).toEqual([
      'Context',
      'emit DATASET_UPDATED',
      'handleClick · END',
    ]);
    const emit = tree[0]!.children[1]!;
    expect(emit.children.map((c) => c.label)).toEqual([
      'onDatasetB · START',
      'onDatasetC · START',
    ]);
    expect(emit.children[0]!.children.map((c) => c.label)).toEqual([
      'onDatasetB · END',
    ]);
  });
});

describe('tree-helpers', () => {
  it('classifies values', () => {
    expect(getValueType(null)).toBe('null');
    expect(getValueType([1])).toBe('array');
    expect(hasChildren({ a: 1 })).toBe(true);
    expect(displayValue('x')).toBe('"x"');
  });
});
