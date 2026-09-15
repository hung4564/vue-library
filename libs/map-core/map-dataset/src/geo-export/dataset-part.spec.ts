import { describe, expect, it } from 'vitest';
import { createGroupDataset, createRootDataset } from '../model/dataset.base';
import { createDatasetPartListViewUiComponentBuilder } from '../model/list/builder';
import {
  createDatasetPartGeoExport,
  isGeoExportPart,
  resolveGeoExportOption,
} from './dataset-part';

describe('geo-export dataset part', () => {
  it('isGeoExportPart detects part', () => {
    const part = createDatasetPartGeoExport('export', {
      formats: ['geojson'],
      sourceCrs: '4326',
    });
    expect(isGeoExportPart(part)).toBe(true);
    expect(part.type).toBe('geo-export');
    expect(part.getOptions()).toEqual({
      formats: ['geojson'],
      sourceCrs: '4326',
    });
  });

  it('resolves options: part wins over menu override', () => {
    const root = createRootDataset('demo');
    const list = createDatasetPartListViewUiComponentBuilder('Cities').build();
    root.add(list);

    expect(
      resolveGeoExportOption(list, {
        formats: ['csv'],
        sourceCrs: '4326',
      }),
    ).toEqual({
      formats: ['csv'],
      sourceCrs: '4326',
    });

    root.add(
      createDatasetPartGeoExport('export', {
        formats: ['geojson'],
        targetCrs: '3857',
      }),
    );

    expect(
      resolveGeoExportOption(list, {
        formats: ['csv'],
        sourceCrs: '4326',
      }),
    ).toEqual({
      formats: ['geojson'],
      sourceCrs: '4326',
      targetCrs: '3857',
    });
  });

  it('finds part when list is nested under a group (demo tree)', () => {
    const root = createRootDataset('demo');
    const group = createGroupDataset('group');
    const list = createDatasetPartListViewUiComponentBuilder('Cities').build();
    const onExport = async () => undefined;
    group.add(list);
    root.add(group);
    root.add(
      createDatasetPartGeoExport('export', {
        onExport,
        scopes: ['all', 'filtered', 'selected'],
      }),
    );

    const resolved = resolveGeoExportOption(list);
    expect(resolved?.onExport).toBe(onExport);
    expect(resolved?.scopes).toEqual(['all', 'filtered', 'selected']);
  });
});
