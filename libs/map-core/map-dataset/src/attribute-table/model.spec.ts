import type { FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  buildAttributeTable,
  resolveAttributeTableColumns,
  resolveAttributeTableComponentRef,
} from './model';

const fc: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: '1',
      properties: { name: 'ha noi', pop: 1000 },
      geometry: { type: 'Point', coordinates: [0, 0] },
    },
  ],
};

describe('attribute-table model columns', () => {
  it('resolves sortable format cellComponent and headerComponent', () => {
    const cell = () => null;
    const header = () => null;
    const columns = resolveAttributeTableColumns(fc, [
      {
        key: 'name',
        label: 'Name',
        format: (v) => String(v).toUpperCase(),
        cellComponent: 'demo-cell',
        headerComponent: 'demo-header',
      },
      {
        key: 'pop',
        sortable: false,
        cellComponent: cell,
        headerComponent: header,
      },
      '__geometry',
    ]);
    expect(columns[0]?.sortable).toBe(true);
    expect(columns[0]?.cellComponent).toBe('demo-cell');
    expect(columns[0]?.headerComponent).toBe('demo-header');
    expect(typeof columns[0]?.format).toBe('function');
    expect(columns[1]?.sortable).toBe(false);
    expect(columns[1]?.cellComponent).toBe(cell);
    expect(columns[1]?.headerComponent).toBe(header);
    expect(columns[2]?.key).toBe('__geometry');
  });

  it('resolveAttributeTableComponentRef maps string to componentKey', () => {
    expect(resolveAttributeTableComponentRef('my-key')).toEqual({
      componentKey: 'my-key',
    });
    const comp = () => null;
    expect(resolveAttributeTableComponentRef(comp)).toEqual({
      defaultComponent: comp,
    });
    expect(resolveAttributeTableComponentRef(null)).toEqual({});
    expect(resolveAttributeTableComponentRef('  ')).toEqual({});
  });

  it('applies format when building cells', () => {
    const { rows, columns } = buildAttributeTable(fc, [
      {
        key: 'name',
        format: (v) => `*${String(v ?? '').toUpperCase()}*`,
      },
      { key: 'pop', format: (v) => Number(v).toLocaleString('en-US') },
    ]);
    expect(columns).toHaveLength(2);
    expect(rows[0]?.cells.name).toBe('*HA NOI*');
    expect(rows[0]?.cells.pop).toBe('1,000');
  });
});
