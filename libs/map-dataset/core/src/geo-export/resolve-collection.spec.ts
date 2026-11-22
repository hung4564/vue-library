import type { FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';

import { createDataManagement } from '../data-management';
import type { IDataset } from '../interfaces/dataset.base';
import { createRootDataset } from '../model/dataset.base';
import { createDatasetPartListViewUiComponent } from '../model/list/model';
import {
  clearGeoExportActiveSource,
  setGeoExportActiveSource,
} from './active-source';
import { resolveExportCollection } from './resolve-collection';

const fcAll: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: '1',
      properties: { name: 'A' },
      geometry: { type: 'Point', coordinates: [0, 0] },
    },
    {
      type: 'Feature',
      id: '2',
      properties: { name: 'B' },
      geometry: { type: 'Point', coordinates: [1, 1] },
    },
  ],
};

const fcSelected: FeatureCollection = {
  type: 'FeatureCollection',
  features: [fcAll.features[0]],
};

const fcFiltered: FeatureCollection = {
  type: 'FeatureCollection',
  features: [fcAll.features[1]],
};

const fakeLayer = {
  id: 'layer-1',
  getName: () => 'Cities',
  getParent: () => undefined,
} as unknown as IDataset;

describe('resolveExportCollection', () => {
  it('prefers getCollection over AT / DM', async () => {
    setGeoExportActiveSource('m', {
      layerId: 'layer-1',
      getSearch: () => 'x',
      getSort: () => [],
      getSelectedIds: () => ['1'],
      resolveSelectedCollection: async () => fcSelected,
      resolveFilteredCollection: async () => fcFiltered,
    });
    const custom: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };
    const result = await resolveExportCollection({
      layer: fakeLayer,
      mapId: 'm',
      scope: 'selected',
      getCollection: async () => custom,
    });
    expect(result).toBe(custom);
    clearGeoExportActiveSource('m');
  });

  it('uses AT bridge for selected and filtered', async () => {
    setGeoExportActiveSource('m', {
      layerId: 'layer-1',
      getSearch: () => 'B',
      getSort: () => [{ key: 'name', dir: 'asc' }],
      getSelectedIds: () => ['1'],
      resolveSelectedCollection: async () => fcSelected,
      resolveFilteredCollection: async () => fcFiltered,
    });
    expect(
      await resolveExportCollection({
        layer: fakeLayer,
        mapId: 'm',
        scope: 'selected',
      }),
    ).toBe(fcSelected);
    expect(
      await resolveExportCollection({
        layer: fakeLayer,
        mapId: 'm',
        scope: 'filtered',
      }),
    ).toBe(fcFiltered);
    clearGeoExportActiveSource('m');
  });

  it('lists filtered/selected via data-management when no AT bridge', async () => {
    const root = createRootDataset('root');
    const list = createDatasetPartListViewUiComponent('Cities');
    const management = createDataManagement('dm', {
      store: 'local',
      format: 'feature-collection',
      initData: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 'a',
            properties: { name: 'Alpha' },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
          {
            type: 'Feature',
            id: 'b',
            properties: { name: 'Beta' },
            geometry: { type: 'Point', coordinates: [1, 1] },
          },
        ],
      },
    });
    root.add(list);
    root.add(management);

    const selected = await resolveExportCollection({
      layer: list,
      scope: 'selected',
      ids: ['a'],
    });
    expect(selected?.features).toHaveLength(1);
    expect(selected?.features[0]?.properties?.name).toBe('Alpha');

    const filtered = await resolveExportCollection({
      layer: list,
      scope: 'filtered',
      search: 'Bet',
    });
    expect(filtered?.features.length).toBeGreaterThanOrEqual(1);
    expect(
      filtered?.features.every((f) =>
        String(f.properties?.name ?? '').includes('Bet'),
      ),
    ).toBe(true);

    const all = await resolveExportCollection({
      layer: list,
      scope: 'all',
    });
    expect(all?.features).toHaveLength(2);
  });
});
