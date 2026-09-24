import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  attributeTableControlId,
  clearPendingAttributeTableSelectRows,
  queueAttributeTableSelectRows,
  takePendingAttributeTableSelectRows,
} from './model';

vi.mock('@hungpvq/map-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hungpvq/map-core')>();
  return {
    ...actual,
    runMapControlAction: vi.fn(),
  };
});

import { runMapControlAction } from '@hungpvq/map-core';

describe('attributeTableControlId', () => {
  it('scopes control id by layer', () => {
    expect(attributeTableControlId('layer-a')).toBe(
      'mapAttributeTable:layer-a',
    );
  });
});

describe('queueAttributeTableSelectRows', () => {
  beforeEach(() => {
    vi.mocked(runMapControlAction).mockClear();
    clearPendingAttributeTableSelectRows('m1');
    clearPendingAttributeTableSelectRows('m1', 'layer-a');
    clearPendingAttributeTableSelectRows('m1', 'layer-b');
  });

  it('targets the per-layer control and keeps pending keyed by layer', () => {
    queueAttributeTableSelectRows('m1', ['f1', 'f2'], 'layer-b');

    expect(runMapControlAction).toHaveBeenCalledWith(
      'm1',
      'mapAttributeTable:layer-b',
      'mapAttributeTable.selectRows',
      { ids: ['f1', 'f2'], layerId: 'layer-b' },
    );
    expect(takePendingAttributeTableSelectRows('m1', 'layer-a')).toBeNull();
    expect(takePendingAttributeTableSelectRows('m1', 'layer-b')).toEqual([
      'f1',
      'f2',
    ]);
  });

  it('does not let another layer clear a different pending queue', () => {
    queueAttributeTableSelectRows('m1', ['a'], 'layer-a');
    queueAttributeTableSelectRows('m1', ['b'], 'layer-b');
    clearPendingAttributeTableSelectRows('m1', 'layer-a');

    expect(takePendingAttributeTableSelectRows('m1', 'layer-a')).toBeNull();
    expect(takePendingAttributeTableSelectRows('m1', 'layer-b')).toEqual(['b']);
  });
});
