import type { FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';

import { LIST_VIEW_MENU_ID } from '../menu/items';
import { findAllComponentsByType } from '../model/visitors/helpers';
import {
  createGeoJsonDataset,
  createGeoJsonLayersDataset,
  splitGeojsonByGdbLayer,
} from './builder';

const pointCollection: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'A' },
      geometry: { type: 'Point', coordinates: [106.7, 10.8] },
    },
  ],
};

const mixedCollection: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'pt' },
      geometry: { type: 'Point', coordinates: [106.7, 10.8] },
    },
    {
      type: 'Feature',
      properties: { name: 'ln' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.7, 10.8],
          [106.8, 10.9],
        ],
      },
    },
  ],
};

describe('createGeoJsonDataset', () => {
  it('stamps _id and promoteId for Identify↔AttributeTable matching', () => {
    const dataset = createGeoJsonDataset({
      name: 'WorldCities',
      geojson: pointCollection,
      type: 'point',
    });
    const source = findAllComponentsByType(dataset, 'source')[0] as {
      getData?: () => FeatureCollection;
      getMapboxSource?: () => { promoteId?: string; data?: FeatureCollection };
    };
    const data = source.getData?.() ?? source.getMapboxSource?.()?.data;
    expect(data?.features?.[0]?.properties?._id).toBe('f:0');
    expect(data?.features?.[0]?.id).toBe('f:0');
    expect(source.getMapboxSource?.()?.promoteId).toBe('_id');

    const identify = findAllComponentsByType(dataset, 'identify')[0] as {
      config?: { field_id?: string };
    };
    expect(identify.config?.field_id).toBe('_id');
  });

  it('builds root with list, bound, source, layer, and identify parts', () => {
    const dataset = createGeoJsonDataset({
      name: 'Cities',
      geojson: pointCollection,
      type: 'point',
      color: '#ff0000',
      opacity: 0.8,
    });

    expect(dataset.getName()).toBe('Cities');
    expect(findAllComponentsByType(dataset, 'list').length).toBeGreaterThan(0);
    expect(findAllComponentsByType(dataset, 'bound').length).toBe(1);
    expect(findAllComponentsByType(dataset, 'source').length).toBe(1);
    expect(findAllComponentsByType(dataset, 'layer').length).toBeGreaterThan(0);
    expect(findAllComponentsByType(dataset, 'identify').length).toBe(1);

    const list = findAllComponentsByType(dataset, 'list')[0] as {
      color?: string;
      getMenus?: () => { id?: string }[];
    };
    expect(list.color).toBe('#ff0000');
    const menuIds = (list.getMenus?.() ?? []).map((m) => m.id);
    expect(menuIds).toContain(LIST_VIEW_MENU_ID.layer.toggleShow);
    expect(menuIds).toContain(LIST_VIEW_MENU_ID.layer.identify);
    expect(menuIds).toContain(LIST_VIEW_MENU_ID.layer.exportGeo);
    expect(menuIds).toContain(LIST_VIEW_MENU_ID.layer.attributeTable);
    expect(menuIds).toContain(LIST_VIEW_MENU_ID.layer.fillBound);
  });

  it('creates one MapLibre style layer per geometry type when type is auto', () => {
    const dataset = createGeoJsonDataset({
      name: 'Mixed',
      geojson: mixedCollection,
      type: 'auto',
    });
    const layerNode = findAllComponentsByType(dataset, 'layer')[0] as {
      getData?: () => unknown[];
    };
    expect(layerNode.getData?.()?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it('skips bound when bbox is null', () => {
    const dataset = createGeoJsonDataset({
      name: 'NoBound',
      geojson: pointCollection,
      type: 'point',
      bbox: null,
    });
    expect(findAllComponentsByType(dataset, 'bound').length).toBe(0);
  });

  it('omits Export / Attribute table when disabled via options', () => {
    const dataset = createGeoJsonDataset({
      name: 'NoMenus',
      geojson: pointCollection,
      type: 'point',
      export: false,
      attributeTable: false,
    });
    const list = findAllComponentsByType(dataset, 'list')[0] as {
      getMenus?: () => { id?: string }[];
    };
    const menuIds = (list.getMenus?.() ?? []).map((m) => m.id);
    expect(menuIds).not.toContain(LIST_VIEW_MENU_ID.layer.exportGeo);
    expect(menuIds).not.toContain(LIST_VIEW_MENU_ID.layer.attributeTable);
  });

  it('uses provided bbox without recomputing', () => {
    const bbox: [number, number, number, number] = [1, 2, 3, 4];
    const dataset = createGeoJsonDataset({
      name: 'FixedBbox',
      geojson: pointCollection,
      type: 'point',
      bbox,
    });
    const bound = findAllComponentsByType(dataset, 'bound')[0] as {
      getData?: () => unknown;
    };
    expect(bound.getData?.()).toEqual(bbox);
  });
});

describe('createGeoJsonLayersDataset', () => {
  it('groups 2+ layers like MBTiles with parent fillbound', () => {
    const roads: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { __gdb_layer: 'roads' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [106, 10],
              [107, 11],
            ],
          },
        },
      ],
    };
    const buildings: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { __gdb_layer: 'buildings' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [106, 10],
                [106.1, 10],
                [106.1, 10.1],
                [106, 10.1],
                [106, 10],
              ],
            ],
          },
        },
      ],
    };

    const dataset = createGeoJsonLayersDataset({
      name: 'DemoGDB',
      type: 'auto',
      layers: [
        { name: 'roads', geojson: roads },
        { name: 'buildings', geojson: buildings },
      ],
    });

    expect(findAllComponentsByType(dataset, 'source').length).toBe(2);
    // Root parent bound + one bound per feature class.
    expect(findAllComponentsByType(dataset, 'bound').length).toBe(3);

    const parentGroup = dataset
      .getChildren()
      .find(
        (c) =>
          c.getName() === 'DemoGDB' &&
          typeof (c as { getChildren?: () => unknown }).getChildren ===
            'function',
      ) as {
      getChildren: () => Array<{
        getName: () => string;
        getMenus?: () => { id?: string }[];
        getChildren?: () => Array<{
          getName: () => string;
          color?: string;
          getMenus?: () => { id?: string }[];
          getChildren?: () => Array<{
            type?: string;
            getData?: () => unknown[];
            color?: string;
            getMenus?: () => { id?: string }[];
          }>;
        }>;
      }>;
    };
    const parentList = parentGroup
      .getChildren()
      .find((c) => c.getName() === 'DemoGDB');
    expect(parentList).toBeTruthy();
    const menuIds = (parentList!.getMenus?.() ?? []).map((m) => m.id);
    expect(menuIds).toContain(LIST_VIEW_MENU_ID.layer.fillBound);
    const subGroups = parentList!.getChildren!() ?? [];
    expect(subGroups.map((c) => c.getName()).sort()).toEqual([
      'buildings',
      'roads',
    ]);
    // Each sub-group: source before layer; child fillbound; auto paint count.
    const listColors: string[] = [];
    for (const sub of subGroups) {
      const kids = sub.getChildren?.() ?? [];
      const types = kids.map((k) => k.type);
      expect(types.indexOf('source')).toBeLessThan(types.indexOf('layer'));
      const subList = kids.find((k) => k.type === 'list-item') as
        | {
            color?: string;
            getMenus?: () => { id?: string }[];
          }
        | undefined;
      const subMenuIds = (subList?.getMenus?.() ?? []).map((m) => m.id);
      expect(subMenuIds).toContain(LIST_VIEW_MENU_ID.layer.fillBound);
      if (subList?.color) listColors.push(String(subList.color));
      const layerNode = kids.find((k) => k.type === 'layer') as
        { getData?: () => unknown[] } | undefined;
      // auto: area fill + outline + line + point = 4 MapLibre layers
      expect(layerNode?.getData?.()?.length ?? 0).toBe(4);
    }
    expect(listColors.length).toBe(2);
    expect(new Set(listColors).size).toBe(2);
  });

  it('falls back to flat createGeoJsonDataset for a single layer', () => {
    const dataset = createGeoJsonLayersDataset({
      name: 'One',
      layers: [{ name: 'only', geojson: pointCollection }],
    });
    expect(findAllComponentsByType(dataset, 'source').length).toBe(1);
    expect(findAllComponentsByType(dataset, 'bound').length).toBe(1);
  });
});

describe('splitGeojsonByGdbLayer', () => {
  it('splits merged FileGDB features by __gdb_layer', () => {
    const merged: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { __gdb_layer: 'a' },
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
        {
          type: 'Feature',
          properties: { __gdb_layer: 'b' },
          geometry: { type: 'Point', coordinates: [1, 1] },
        },
        {
          type: 'Feature',
          properties: { __gdb_layer: 'a' },
          geometry: { type: 'Point', coordinates: [2, 2] },
        },
      ],
    };
    const parts = splitGeojsonByGdbLayer(merged);
    expect(parts.map((p) => p.name).sort()).toEqual(['a', 'b']);
    expect(parts.find((p) => p.name === 'a')?.geojson.features).toHaveLength(2);
  });
});
