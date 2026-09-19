import { describe, expect, it } from 'vitest';
import {
  buildRequestFlowSteps,
  buildRequestFlowTree,
  buildStructuredLogs,
  collectLogsByRequestId,
  filterLogs,
  formatFlowDelta,
  namespaceParts,
  type LevelFilter,
} from './log-helpers';
import { displayValue, getValueType, hasChildren } from './tree-helpers';

function entry(
  id: string,
  level: 'debug' | 'info' | 'warn' | 'error',
  namespaces: string[],
  args: unknown[],
  ts = 1,
) {
  return {
    id,
    header: { ts, level, namespaces },
    args,
  };
}

describe('log-helpers', () => {
  it('filterLogs by level and search', () => {
    const list = [
      entry('1', 'info', ['map'], ['hello'], 1),
      entry('2', 'error', ['map'], ['boom'], 2),
    ];
    const filtered = filterLogs(
      list,
      'boom',
      'error' as LevelFilter,
      'all',
      'all',
      1,
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('buildStructuredLogs is a flat log list', () => {
    const list = [
      entry('1', 'info', [], ['a'], 1),
      entry('2', 'warn', [], ['b'], 2),
    ];
    const structured = buildStructuredLogs(list);
    expect(structured).toHaveLength(2);
    expect(structured.every((item) => item.type === 'log')).toBe(true);
  });

  it('filterLogs by root namespace only', () => {
    const list = [
      entry('1', 'info', ['menu', 'click'], ['a'], 1),
      entry('2', 'info', ['menu', 'other'], ['b'], 2),
      entry('3', 'info', ['map:core', 'store'], ['c'], 3),
    ];
    const filtered = filterLogs(
      list,
      '',
      'all' as LevelFilter,
      'menu',
      'all',
      1,
    );
    expect(filtered.map((l) => l.id)).toEqual(['1', '2']);
  });

  it('filterLogs by requestId', () => {
    const list = [
      {
        id: '1',
        header: {
          ts: 1,
          level: 'info' as const,
          namespaces: ['menu'],
          requestId: 'req-aaa',
        },
        args: ['a'],
      },
      {
        id: '2',
        header: {
          ts: 2,
          level: 'info' as const,
          namespaces: ['menu'],
          requestId: 'req-bbb',
        },
        args: ['b'],
      },
    ];
    const filtered = filterLogs(
      list,
      '',
      'all' as LevelFilter,
      'all',
      'all',
      1,
      'bbb',
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('namespaceParts strips uuid mapId', () => {
    const id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const parts = namespaceParts([id, 'menu', 'click']);
    expect(parts.mapId).toBe(id);
    expect(parts.path).toBe('menu:click');
  });

  it('collectLogsByRequestId prefers index over equal ts', () => {
    const list = [
      {
        id: 'end',
        header: {
          ts: 100,
          index: 3,
          level: 'debug' as const,
          namespaces: ['x'],
          requestId: 'req-i',
          fn: 'work',
          functionId: 'fn-1',
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
          requestId: 'req-i',
          fn: 'work',
          functionId: 'fn-1',
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
          requestId: 'req-i',
          fn: 'work',
          functionId: 'fn-1',
        },
        args: ['mid'],
      },
    ];
    const matched = collectLogsByRequestId(list, 'req-i');
    expect(matched.map((l) => l.id)).toEqual(['start', 'mid', 'end']);
    const tree = buildRequestFlowTree(matched);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.children.map((c) => c.label)).toEqual([
      'mid',
      'work · END',
    ]);
  });

  it('buildRequestFlowTree keeps write order when mid arrives after END', () => {
    const list = [
      {
        id: 's',
        header: {
          ts: 1,
          index: 1,
          level: 'debug' as const,
          namespaces: ['x'],
          requestId: 'req-e',
          fn: 'work',
          functionId: 'fn-1',
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
          requestId: 'req-e',
          fn: 'work',
          functionId: 'fn-1',
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
          requestId: 'req-e',
          fn: 'work',
          functionId: 'fn-1',
          flowKind: 'call' as const,
        },
        args: ['late-mid'],
      },
    ];
    const tree = buildRequestFlowTree(collectLogsByRequestId(list, 'req-e'));
    expect(tree[0]!.children.map((c) => c.label)).toEqual([
      'work · END',
      'late-mid',
    ]);
  });

  it('collectLogsByRequestId is chronological', () => {
    const list = [
      {
        id: '2',
        header: {
          ts: 200,
          level: 'info' as const,
          namespaces: ['mitt'],
          requestId: 'req-1',
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
          requestId: 'req-1',
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
          requestId: 'req-other',
        },
        args: ['c'],
      },
    ];
    const matched = collectLogsByRequestId(list, 'req-1');
    expect(matched.map((l) => l.id)).toEqual(['1', '2']);
    const steps = buildRequestFlowSteps(matched);
    expect(steps.map((s) => s.label)).toEqual(['a', 'b']);
    expect(steps.map((s) => s.span)).toEqual(['click', 'emit']);
    expect(steps[1]!.deltaMs).toBe(100);
    expect(formatFlowDelta(100)).toBe('+100ms');
  });

  it('buildRequestFlowTree nests handlers under emit', () => {
    const list = [
      {
        id: 'a-start',
        header: {
          ts: 10,
          level: 'debug' as const,
          namespaces: ['menu'],
          requestId: 'req-t',
          fn: 'handleClick',
          span: 'menu.action',
          flowKind: 'call' as const,
          flowDepth: 0,
          functionId: 'fn-a',
        },
        args: ['START'],
      },
      {
        id: 'mid',
        header: {
          ts: 15,
          level: 'debug' as const,
          namespaces: ['menu'],
          requestId: 'req-t',
          fn: 'handleClick',
          span: 'menu.action',
          flowKind: 'call' as const,
          flowDepth: 0,
          functionId: 'fn-a',
        },
        args: ['Context'],
      },
      {
        id: 'emit',
        header: {
          ts: 20,
          level: 'debug' as const,
          namespaces: ['mitt'],
          requestId: 'req-t',
          fn: 'handleClick',
          span: 'menu.action',
          flowKind: 'emit' as const,
          eventName: 'DATASET_UPDATED',
          flowDepth: 1,
          parentFn: 'handleClick',
          functionId: 'fn-a',
        },
        args: ['EMIT'],
      },
      {
        id: 'hb',
        header: {
          ts: 30,
          level: 'debug' as const,
          namespaces: ['mitt'],
          requestId: 'req-t',
          fn: 'onDatasetB',
          span: 'mitt.handler',
          flowKind: 'handler' as const,
          eventName: 'DATASET_UPDATED',
          flowDepth: 1,
          parentFn: 'handleClick',
          functionId: 'fn-b',
        },
        args: ['START'],
      },
      {
        id: 'hb-end',
        header: {
          ts: 35,
          level: 'debug' as const,
          namespaces: ['mitt'],
          requestId: 'req-t',
          fn: 'onDatasetB',
          span: 'mitt.handler',
          flowKind: 'handler' as const,
          eventName: 'DATASET_UPDATED',
          flowDepth: 1,
          functionId: 'fn-b',
        },
        args: ['END'],
      },
      {
        id: 'hc',
        header: {
          ts: 40,
          level: 'debug' as const,
          namespaces: ['mitt'],
          requestId: 'req-t',
          fn: 'onDatasetC',
          span: 'mitt.handler',
          flowKind: 'handler' as const,
          eventName: 'DATASET_UPDATED',
          flowDepth: 1,
          parentFn: 'handleClick',
          functionId: 'fn-c',
        },
        args: ['START'],
      },
      {
        id: 'hc-end',
        header: {
          ts: 45,
          level: 'debug' as const,
          namespaces: ['mitt'],
          requestId: 'req-t',
          fn: 'onDatasetC',
          span: 'mitt.handler',
          flowKind: 'handler' as const,
          eventName: 'DATASET_UPDATED',
          flowDepth: 1,
          functionId: 'fn-c',
        },
        args: ['END'],
      },
      {
        id: 'a-end',
        header: {
          ts: 50,
          level: 'debug' as const,
          namespaces: ['menu'],
          requestId: 'req-t',
          fn: 'handleClick',
          span: 'menu.action',
          flowKind: 'call' as const,
          flowDepth: 0,
          functionId: 'fn-a',
        },
        args: ['END'],
      },
    ];
    const tree = buildRequestFlowTree(collectLogsByRequestId(list, 'req-t'));
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
