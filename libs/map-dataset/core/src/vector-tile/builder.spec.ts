import { describe, expect, it } from 'vitest';

import {
  mbtilesLocalTilesUrl,
  metaFromMbtilesRows,
  parseVectorTileProtocolUrl,
  pmtilesLocalTilesUrl,
  sourceLayerOptionsFromMeta,
} from './archives';
import { createVectorTileDataset } from './builder';

describe('createVectorTileDataset', () => {
  it('builds root with vector source tiles and flat list for one source-layer', () => {
    const dataset = createVectorTileDataset({
      name: 'Countries',
      tiles: ['https://example.com/{z}/{x}/{y}.pbf'],
      sourceLayer: 'countries',
      styleType: 'area',
      minzoom: 0,
      maxzoom: 6,
      bounds: [-180, -85, 180, 85],
    });

    expect(dataset.getName()).toBe('Countries');
    expect(dataset.getChildren().length).toBeGreaterThan(0);

    const group = dataset
      .getChildren()
      .find(
        (c) =>
          c.getName() === 'Countries' &&
          typeof (c as { getChildren?: () => unknown }).getChildren ===
            'function',
      ) as {
      getChildren: () => Array<{
        getName: () => string;
        getChildren?: () => unknown;
      }>;
    };
    expect(group).toBeTruthy();
    const parts = group.getChildren();
    // Flat list: list + mapbox layers — no nested GroupSubList children
    expect(parts.some((p) => p.getName() === 'Countries')).toBe(true);
    const listPart = parts.find((p) => p.getName() === 'Countries');
    expect(listPart?.getChildren).toBeUndefined();
  });

  it('creates one parent GroupSubList with SubLists collapsed by default when 2+ source-layers', () => {
    const dataset = createVectorTileDataset({
      name: 'Archive',
      tiles: ['mbtiles-local://arch/{z}/{x}/{y}'],
      sourceLayers: ['roads', 'buildings'],
      styleType: 'auto',
    });
    const parentGroup = dataset
      .getChildren()
      .find(
        (c) =>
          c.getName() === 'Archive' &&
          typeof (c as { getChildren?: () => unknown }).getChildren ===
            'function' &&
          (c as { getChildren: () => unknown[] })
            .getChildren()
            .some((child) => child.getName() === 'Archive'),
      );
    expect(parentGroup).toBeTruthy();
    const parentList = (
      parentGroup as {
        getChildren: () => Array<{
          getName: () => string;
          config?: { init_show_children?: boolean };
          getChildren?: () => Array<{ getName: () => string }>;
        }>;
      }
    )
      .getChildren()
      .find((c) => c.getName() === 'Archive');
    expect(parentList).toBeTruthy();
    expect(parentList!.config?.init_show_children).toBe(false);
    expect(typeof parentList!.getChildren).toBe('function');
    const subNames = parentList!.getChildren!()
      .map((c) => c.getName())
      .sort();
    expect(subNames).toEqual(['buildings', 'roads']);
  });

  it('keeps a single source-layer as a flat list (no GroupSubList)', () => {
    const dataset = createVectorTileDataset({
      name: 'One',
      tiles: ['pmtiles-local://arch/{z}/{x}/{y}'],
      sourceLayers: ['only'],
      styleType: 'auto',
    });
    const group = dataset
      .getChildren()
      .find(
        (c) =>
          c.getName() === 'One' &&
          typeof (c as { getChildren?: () => unknown }).getChildren ===
            'function',
      ) as {
      getChildren: () => Array<{
        getName: () => string;
        getChildren?: () => unknown[];
      }>;
    };
    expect(group).toBeTruthy();
    const list = group.getChildren().find((c) => c.getName() === 'One');
    expect(list).toBeTruthy();
    expect(list!.getChildren).toBeUndefined();
  });

  it('normalizes url into tiles', () => {
    const dataset = createVectorTileDataset({
      name: 'Demo',
      url: 'https://example.com/{z}/{x}/{y}.pbf',
    });
    expect(dataset.getName()).toBe('Demo');
  });
});

describe('vector tile protocol URL', () => {
  it('builds and parses archive tile templates', () => {
    expect(mbtilesLocalTilesUrl('arch-1')).toBe(
      'mbtiles-local://arch-1/{z}/{x}/{y}',
    );
    expect(parseVectorTileProtocolUrl('mbtiles-local://arch-1/3/2/1')).toEqual({
      archiveId: 'arch-1',
      z: 3,
      x: 2,
      y: 1,
    });
    expect(pmtilesLocalTilesUrl('p1')).toBe('pmtiles-local://p1/{z}/{x}/{y}');
    expect(parseVectorTileProtocolUrl('pmtiles-local://p1/1/2/3')).toEqual({
      archiveId: 'p1',
      z: 1,
      x: 2,
      y: 3,
    });
  });
});

describe('metaFromMbtilesRows', () => {
  it('detects vector and all source layers', () => {
    const meta = metaFromMbtilesRows('a1', [
      { name: 'format', value: 'pbf' },
      { name: 'name', value: 'Demo' },
      {
        name: 'json',
        value: JSON.stringify({
          vector_layers: [
            {
              id: 'a',
              fields: { name: 'String', pop: 'Number' },
            },
            { id: 'b', fields: {} },
          ],
          tilestats: {
            layers: [{ layer: 'a', geometry: 'Polygon' }],
          },
        }),
      },
    ]);
    expect(meta.tileKind).toBe('vector');
    expect(meta.sourceLayers).toEqual(['a', 'b']);
    expect(meta.sourceLayer).toBe('a');
    expect(meta.sourceLayerInfos?.[0]).toMatchObject({
      id: 'a',
      fields: { name: 'String', pop: 'Number' },
      geometryTypes: ['Polygon'],
    });
    expect(sourceLayerOptionsFromMeta(meta)).toEqual([
      {
        id: 'a',
        enabled: true,
        fields: { name: 'String', pop: 'Number' },
        geometryTypes: ['Polygon'],
        description: undefined,
      },
      {
        id: 'b',
        enabled: true,
        fields: undefined,
        geometryTypes: undefined,
        description: undefined,
      },
    ]);
  });

  it('detects raster png', () => {
    const meta = metaFromMbtilesRows('a2', [
      { name: 'format', value: 'png' },
      { name: 'name', value: 'Raster' },
    ]);
    expect(meta.tileKind).toBe('raster');
    expect(meta.sourceLayers).toEqual([]);
  });
});
