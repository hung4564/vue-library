import { describe, expect, it } from 'vitest';
import type { AttributeTableRow } from './model';
import {
  filterAttributeTableRowsByColumnText,
  matchAttributeTableColumnText,
} from './filter';

const rows: AttributeTableRow[] = [
  {
    id: '1',
    cells: { name: 'Alpha', city: 'Hue' },
    feature: {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [0, 0] },
    },
  },
  {
    id: '2',
    cells: { name: 'Beta', city: 'Da Nang' },
    feature: {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [1, 1] },
    },
  },
  {
    id: '3',
    cells: { name: 'alphabet', city: 'Hue' },
    feature: {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [2, 2] },
    },
  },
];

describe('attribute-table column text filter', () => {
  it('matches contains (case-insensitive)', () => {
    expect(matchAttributeTableColumnText('Alpha', 'alp')).toBe(true);
    expect(matchAttributeTableColumnText('Alpha', 'zzz')).toBe(false);
    expect(matchAttributeTableColumnText('Alpha', '  ')).toBe(true);
  });

  it('matches equals', () => {
    expect(matchAttributeTableColumnText('Alpha', 'alpha', 'equals')).toBe(
      true,
    );
    expect(matchAttributeTableColumnText('Alpha', 'alp', 'equals')).toBe(
      false,
    );
  });

  it('filters by one column contains', () => {
    const filtered = filterAttributeTableRowsByColumnText(rows, {
      key: 'name',
      query: 'alp',
    });
    expect(filtered.map((r) => r.id)).toEqual(['1', '3']);
  });

  it('ANDs multiple column filters from a record', () => {
    const filtered = filterAttributeTableRowsByColumnText(rows, {
      name: 'a',
      city: 'hue',
    });
    expect(filtered.map((r) => r.id)).toEqual(['1', '3']);
  });

  it('returns all rows when filters empty', () => {
    expect(filterAttributeTableRowsByColumnText(rows, {})).toEqual(rows);
    expect(filterAttributeTableRowsByColumnText(rows, null)).toEqual(rows);
    expect(
      filterAttributeTableRowsByColumnText(rows, { key: 'name', query: '  ' }),
    ).toEqual(rows);
  });
});
