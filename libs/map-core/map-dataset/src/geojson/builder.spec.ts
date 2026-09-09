import { describe, expect, it } from 'vitest';
import type { FeatureCollection } from 'geojson';
import { LIST_VIEW_MENU_ID } from '../menu/items';
import { findAllComponentsByType } from '../model/visitors/helpers';
import { createGeoJsonDataset } from './builder';

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
