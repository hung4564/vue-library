import { describe, expect, it } from 'vitest';
import {
  buildStructuredLogs,
  filterLogs,
  namespaceParts,
  type LevelFilter,
} from './log-helpers';
import { displayValue, getValueType, hasChildren } from './tree-helpers';

describe('log-helpers', () => {
  it('filterLogs by level and search', () => {
    const list = [
      {
        id: '1',
        level: 'info' as const,
        namespaces: ['map'],
        args: ['hello'],
        timestamp: 1,
      },
      {
        id: '2',
        level: 'error' as const,
        namespaces: ['map'],
        args: ['boom'],
        timestamp: 2,
      },
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

  it('buildStructuredLogs nests groups', () => {
    const list = [
      {
        id: 'g',
        level: 'groupCollapsed' as const,
        namespaces: [],
        args: ['G'],
        timestamp: 1,
      },
      {
        id: '1',
        level: 'info' as const,
        namespaces: [],
        args: ['inner'],
        timestamp: 2,
      },
      {
        id: 'e',
        level: 'groupEnd' as const,
        namespaces: [],
        args: [],
        timestamp: 3,
      },
    ];
    const structured = buildStructuredLogs(list);
    expect(structured).toHaveLength(1);
    expect(structured[0].type).toBe('group');
    if (structured[0].type === 'group') {
      expect(structured[0].children).toHaveLength(1);
    }
  });

  it('namespaceParts strips uuid mapId', () => {
    const id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const parts = namespaceParts([id, 'menu', 'click']);
    expect(parts.mapId).toBe(id);
    expect(parts.path).toBe('menu:click');
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
