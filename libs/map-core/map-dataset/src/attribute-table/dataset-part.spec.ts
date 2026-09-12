import { describe, expect, it } from 'vitest';
import { createRootDataset } from '../model/dataset.base';
import { createDatasetPartListViewUiComponentBuilder } from '../model/list';
import {
  createDatasetPartAttributeTable,
  isAttributeTableView,
  resolveAttributeTableColumnsOption,
  resolveAttributeTableExportOption,
  resolveAttributeTableUiOption,
} from './dataset-part';

describe('attribute-table dataset part', () => {
  it('isAttributeTableView detects part', () => {
    const part = createDatasetPartAttributeTable('table', {
      columns: ['name'],
      ui: { sort: false },
      export: { formats: ['geojson'] },
    });
    expect(isAttributeTableView(part)).toBe(true);
    expect(part.getColumns()).toEqual(['name']);
    expect(part.getUi()).toEqual({ sort: false });
    expect(part.getExport()).toEqual({ formats: ['geojson'] });
  });

  it('resolves columns / ui / export: part > override > default', () => {
    const root = createRootDataset('demo');
    const list = createDatasetPartListViewUiComponentBuilder('Cities').build();
    root.add(list);

    expect(resolveAttributeTableColumnsOption(list)).toBeUndefined();
    expect(
      resolveAttributeTableColumnsOption(list, [{ key: 'id', label: 'ID' }]),
    ).toEqual([{ key: 'id', label: 'ID' }]);
    expect(
      resolveAttributeTableUiOption(list, { search: false }),
    ).toEqual({ search: false });
    expect(
      resolveAttributeTableExportOption(list, { formats: ['csv'] }),
    ).toEqual({ formats: ['csv'] });

    root.add(
      createDatasetPartAttributeTable('table', {
        columns: [
          { key: 'name', label: 'Name (part)' },
          { key: 'id', label: 'ID', sortable: false },
        ],
        ui: { sort: false, export: true },
        export: { formats: ['geojson'] },
      }),
    );

    expect(
      resolveAttributeTableColumnsOption(list, [{ key: 'id', label: 'ID' }]),
    ).toEqual([
      { key: 'name', label: 'Name (part)' },
      { key: 'id', label: 'ID', sortable: false },
    ]);
    expect(resolveAttributeTableUiOption(list, { search: false })).toEqual({
      sort: false,
      export: true,
    });
    expect(
      resolveAttributeTableExportOption(list, { formats: ['csv'] }),
    ).toEqual({ formats: ['geojson'] });
  });
});
