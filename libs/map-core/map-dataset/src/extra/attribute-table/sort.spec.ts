import { describe, expect, it } from 'vitest';
import type { AttributeTableRow } from './model';
import {
  sortAttributeTableRows,
  toggleAttributeTableSort,
  type AttributeTableSortState,
} from './sort';

describe('attribute-table sort', () => {
  const rows: AttributeTableRow[] = [
    {
      id: '2',
      cells: { name: 'Beta', n: '2' },
      feature: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0] },
      },
    },
    {
      id: '1',
      cells: { name: 'Alpha', n: '10' },
      feature: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [1, 1] },
      },
    },
  ];

  it('toggles asc/desc on same key', () => {
    const a = toggleAttributeTableSort(null, 'name');
    expect(a).toEqual({ key: 'name', dir: 'asc' });
    expect(toggleAttributeTableSort(a, 'name')).toEqual({
      key: 'name',
      dir: 'desc',
    });
  });

  it('sorts strings and numbers', () => {
    const byName = sortAttributeTableRows(rows, {
      key: 'name',
      dir: 'asc',
    } satisfies AttributeTableSortState);
    expect(byName.map((r) => r.cells.name)).toEqual(['Alpha', 'Beta']);
    const byNum = sortAttributeTableRows(rows, { key: 'n', dir: 'asc' });
    expect(byNum.map((r) => r.cells.n)).toEqual(['2', '10']);
  });
});
