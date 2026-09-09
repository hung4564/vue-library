import { describe, expect, it } from 'vitest';
import type { AttributeTableRow } from './model';
import {
  filterAttributeTableRowsByColumns,
  sortAttributeTableRows,
  toggleAttributeTableMultiSort,
  toggleAttributeTableSort,
  type AttributeTableSortState,
} from './sort';

describe('attribute-table sort', () => {
  const rows: AttributeTableRow[] = [
    {
      id: '2',
      cells: { name: 'Beta', n: '2', city: 'Hue' },
      feature: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0] },
      },
    },
    {
      id: '1',
      cells: { name: 'Alpha', n: '10', city: 'Hue' },
      feature: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [1, 1] },
      },
    },
    {
      id: '3',
      cells: { name: 'Alpha', n: '1', city: 'Da Nang' },
      feature: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [2, 2] },
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
    expect(byName.map((r) => r.cells.name)).toEqual(['Alpha', 'Alpha', 'Beta']);
    const byNum = sortAttributeTableRows(rows, { key: 'n', dir: 'asc' });
    expect(byNum.map((r) => r.cells.n)).toEqual(['1', '2', '10']);
  });

  it('supports multi-column sort and column filters', () => {
    const multi = toggleAttributeTableMultiSort([], 'name');
    const withCity = toggleAttributeTableMultiSort(multi, 'city', true);
    expect(withCity).toEqual([
      { key: 'name', dir: 'asc' },
      { key: 'city', dir: 'asc' },
    ]);
    const sorted = sortAttributeTableRows(rows, withCity);
    expect(sorted.map((r) => r.id)).toEqual(['3', '1', '2']);
    expect(
      filterAttributeTableRowsByColumns(rows, { city: 'da' }).map((r) => r.id),
    ).toEqual(['3']);
  });
});
