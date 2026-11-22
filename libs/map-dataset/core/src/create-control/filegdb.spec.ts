import { describe, expect, it } from 'vitest';

import {
  detectGisFormat,
  isFileGdbPartName,
  isFileGdbZipName,
} from './gis-format';
import {
  ConfigFilegdbHelper,
  createControlGeojsonPreviewPatch,
  featuresWithGeometry,
  FILEGDB_FILE_ACCEPT,
  getCreateControlDataTabs,
  LAYER_TYPES,
  layerNameFromFileGdbFiles,
  looksLikeFileGdbFiles,
  normalizeLayerType,
  suggestLayerName,
} from './index';

describe('CreateControl FileGDB layer type', () => {
  it('exposes filegdb in LAYER_TYPES and helpers', () => {
    expect(LAYER_TYPES.filegdb).toBe('FileGDB');
    expect(normalizeLayerType('filegdb')).toBe('filegdb');
    expect(suggestLayerName('filegdb')).toBe('FileGDB layer');
    expect(getCreateControlDataTabs('filegdb')).toEqual(['file']);
    expect(new ConfigFilegdbHelper().default_value).toMatchObject({
      crs: '4326',
      type: 'auto',
    });
    expect(new ConfigFilegdbHelper().default_value).not.toHaveProperty('color');
    expect(
      new ConfigFilegdbHelper().validationErrors({
        name: 'x',
        geojson: { type: 'FeatureCollection', features: [] },
      } as never),
    ).not.toContain('validation-type');
    expect(FILEGDB_FILE_ACCEPT).toContain('.zip');
  });

  it('detects .gdb.zip, *_gdb.zip, and folder members', () => {
    expect(isFileGdbZipName('Demo.gdb.zip')).toBe(true);
    expect(
      isFileGdbZipName('_static_unosat_filesystem_2340_FL20150730VNM_gdb.zip'),
    ).toBe(true);
    expect(isFileGdbZipName('Demo.zip')).toBe(false);
    expect(detectGisFormat({ name: 'Demo.gdb.zip' })).toBe('filegdb');
    expect(detectGisFormat({ name: 'FL20150730VNM_gdb.zip' })).toBe('filegdb');
    expect(isFileGdbPartName('Demo.gdb/a00000001.gdbtable')).toBe(true);
    expect(
      looksLikeFileGdbFiles([
        { name: 'Demo.gdb/a00000001.gdbtable' },
        { name: 'Demo.gdb/a00000001.gdbtablx' },
      ]),
    ).toBe(true);
    expect(looksLikeFileGdbFiles([{ name: 'FL20150730VNM_gdb.zip' }])).toBe(
      true,
    );
    expect(looksLikeFileGdbFiles([{ name: 'roads.geojson' }])).toBe(false);
  });

  it('suggests layer name from .gdb path', () => {
    expect(
      layerNameFromFileGdbFiles([
        {
          name: 'a00000001.gdbtable',
          webkitRelativePath: 'Demo.gdb/a00000001.gdbtable',
        },
      ]),
    ).toBe('Demo');
    expect(layerNameFromFileGdbFiles([{ name: 'Counties.gdb.zip' }])).toBe(
      'Counties',
    );
    expect(layerNameFromFileGdbFiles([{ name: 'FL20150730VNM_gdb.zip' }])).toBe(
      'FL20150730VNM',
    );
  });

  it('filters attribute-only features without geometry', () => {
    expect(
      featuresWithGeometry([
        { type: 'Feature', properties: { id: 1 }, geometry: null },
        {
          type: 'Feature',
          properties: { id: 2 },
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
      ] as never),
    ).toHaveLength(1);
  });

  it('auto-enables only smaller FileGDB source layers by default', () => {
    const small = {
      name: 'extent',
      geojson: {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            properties: { name: 'A', area: 1 },
            geometry: {
              type: 'Polygon' as const,
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 0],
                ],
              ],
            },
          },
        ],
      },
    };
    const large = {
      name: 'flood',
      geojson: {
        type: 'FeatureCollection' as const,
        features: Array.from({ length: 5001 }, (_, i) => ({
          type: 'Feature' as const,
          properties: { i },
          geometry: { type: 'Point' as const, coordinates: [i, i] },
        })),
      },
    };
    const patch = createControlGeojsonPreviewPatch(
      { type: 'FeatureCollection', features: [] },
      '4326',
      [small, large],
    );
    expect(patch['sourceLayerOptions']).toEqual([
      {
        id: 'extent',
        enabled: true,
        fields: { name: 'String', area: 'Number' },
        geometryTypes: ['Polygon'],
        featureCount: 1,
      },
      {
        id: 'flood',
        enabled: false,
        fields: { i: 'Number' },
        geometryTypes: ['Point'],
        featureCount: 5001,
      },
    ]);
  });
});
