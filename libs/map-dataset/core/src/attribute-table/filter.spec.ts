import { describe, expect, it } from 'vitest';

import {
  filterAttributeTableRowsByColumnText,
  matchAttributeTableColumnFilter,
  matchAttributeTableColumnText,
  resolveAttributeTableVisibleColumns,
} from './filter';
import type { AttributeTableRow } from './model';

const rows: AttributeTableRow[] = [
  {
    id: '1',
    cells: { name: 'Alpha', city: 'Hue', pop: '10', when: '2020-01-15' },
    feature: {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [0, 0] },
    },
  },
  {
    id: '2',
    cells: { name: 'Beta', city: 'Da Nang', pop: '25', when: '2021-06-01' },
    feature: {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [1, 1] },
    },
  },
  {
    id: '3',
    cells: { name: 'alphabet', city: 'Hue', pop: 'n/a', when: 'bad' },
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
    expect(matchAttributeTableColumnText('Alpha', 'alp', 'equals')).toBe(false);
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

describe('attribute-table numeric / date column filters', () => {
  it('matches number_eq / gte / lte', () => {
    expect(matchAttributeTableColumnFilter('10', '10', 'number_eq')).toBe(true);
    expect(matchAttributeTableColumnFilter('10', '11', 'number_eq')).toBe(
      false,
    );
    expect(matchAttributeTableColumnFilter('10', '5', 'number_gte')).toBe(true);
    expect(matchAttributeTableColumnFilter('10', '15', 'number_gte')).toBe(
      false,
    );
    expect(matchAttributeTableColumnFilter('10', '15', 'number_lte')).toBe(
      true,
    );
    expect(matchAttributeTableColumnFilter('10', '5', 'number_lte')).toBe(
      false,
    );
  });

  it('fails non-parseable cells for numeric modes', () => {
    expect(matchAttributeTableColumnFilter('n/a', '10', 'number_eq')).toBe(
      false,
    );
    expect(matchAttributeTableColumnFilter('10', 'x', 'number_eq')).toBe(false);
  });

  it('matches number_between via 1..10 query', () => {
    expect(
      matchAttributeTableColumnFilter('5', '1..10', 'number_between'),
    ).toBe(true);
    expect(
      matchAttributeTableColumnFilter('0', '1..10', 'number_between'),
    ).toBe(false);
    expect(
      matchAttributeTableColumnFilter('11', '1..10', 'number_between'),
    ).toBe(false);
  });

  it('matches number_between via queryEnd', () => {
    expect(
      matchAttributeTableColumnFilter('5', '1', 'number_between', '10'),
    ).toBe(true);
    expect(
      matchAttributeTableColumnFilter('n/a', '1', 'number_between', '10'),
    ).toBe(false);
  });

  it('matches date_eq / gte / lte', () => {
    expect(
      matchAttributeTableColumnFilter('2020-01-15', '2020-01-15', 'date_eq'),
    ).toBe(true);
    expect(
      matchAttributeTableColumnFilter('2020-01-15', '2020-01-16', 'date_eq'),
    ).toBe(false);
    expect(
      matchAttributeTableColumnFilter('2021-06-01', '2020-01-01', 'date_gte'),
    ).toBe(true);
    expect(
      matchAttributeTableColumnFilter('2020-01-15', '2021-01-01', 'date_lte'),
    ).toBe(true);
  });

  it('fails non-parseable cells for date modes', () => {
    expect(
      matchAttributeTableColumnFilter('bad', '2020-01-01', 'date_eq'),
    ).toBe(false);
  });

  it('filters rows with number_between and entry objects', () => {
    const filtered = filterAttributeTableRowsByColumnText(rows, {
      pop: { query: '1..20', mode: 'number_between' },
    });
    expect(filtered.map((r) => r.id)).toEqual(['1']);
  });

  it('filters rows with date_gte', () => {
    const filtered = filterAttributeTableRowsByColumnText(rows, {
      key: 'when',
      query: '2021-01-01',
      mode: 'date_gte',
    });
    expect(filtered.map((r) => r.id)).toEqual(['2']);
  });
});

describe('resolveAttributeTableVisibleColumns', () => {
  const columns = [
    { key: 'a', label: 'A' },
    { key: 'b', label: 'B' },
    { key: 'c', label: 'C' },
  ];

  it('returns all when visibleKeys is null/undefined', () => {
    expect(resolveAttributeTableVisibleColumns(columns, null)).toEqual(columns);
    expect(resolveAttributeTableVisibleColumns(columns, undefined)).toEqual(
      columns,
    );
  });

  it('preserves order from full columns', () => {
    expect(
      resolveAttributeTableVisibleColumns(columns, ['c', 'a']).map(
        (c) => c.key,
      ),
    ).toEqual(['a', 'c']);
  });

  it('returns empty when no keys match', () => {
    expect(resolveAttributeTableVisibleColumns(columns, [])).toEqual([]);
  });
});
