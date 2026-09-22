import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  buildSampleRasterTileUrl,
  isAbsoluteHttpUrl,
  isMapLibreStyleLike,
  isValidRasterTileTemplate,
  validateBasemapSource,
} from './validate-basemap-source';
import { createCustomBasemapItem, isCustomBasemapItem } from './create-custom-basemap';

describe('validateBasemapSource helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('accepts absolute http(s) URLs only', () => {
    expect(isAbsoluteHttpUrl('https://a.com/{z}/{x}/{y}.png')).toBe(true);
    expect(isAbsoluteHttpUrl('http://a.com/style.json')).toBe(true);
    expect(isAbsoluteHttpUrl('/relative/{z}/{x}/{y}.png')).toBe(false);
    expect(isAbsoluteHttpUrl('ftp://a.com/x')).toBe(false);
  });

  it('requires {z}/{x}/{y} for raster templates', () => {
    expect(
      isValidRasterTileTemplate('https://t.com/{z}/{x}/{y}.png'),
    ).toBe(true);
    expect(
      isValidRasterTileTemplate('https://t.com/{z}/{y}/{x}.png'),
    ).toBe(true);
    expect(isValidRasterTileTemplate('https://t.com/{z}/{x}.png')).toBe(false);
    expect(isValidRasterTileTemplate('https://t.com/style.json')).toBe(false);
  });

  it('builds a sample tile URL', () => {
    expect(buildSampleRasterTileUrl('https://t.com/{z}/{x}/{y}.png')).toBe(
      'https://t.com/1/0/0.png',
    );
  });

  it('detects MapLibre-like style JSON', () => {
    expect(
      isMapLibreStyleLike({
        sources: { a: { type: 'vector' } },
        layers: [{ id: 'l', type: 'fill', source: 'a' }],
      }),
    ).toBe(true);
    expect(isMapLibreStyleLike({ sources: {}, layers: [] })).toBe(true);
    expect(isMapLibreStyleLike({ layers: [] })).toBe(false);
    expect(isMapLibreStyleLike(null)).toBe(false);
  });

  it('validateBasemapSource rejects empty / bad raster template', async () => {
    expect(await validateBasemapSource({ type: 'raster', url: '' })).toMatchObject({
      ok: false,
      code: 'empty',
    });
    expect(
      await validateBasemapSource({
        type: 'raster',
        url: 'https://t.com/no-placeholders.png',
      }),
    ).toMatchObject({ ok: false, code: 'invalid-template' });
  });

  it('validateBasemapSource accepts raster when image probe succeeds', async () => {
    class MockImage {
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      referrerPolicy = '';
      set src(_v: string) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    }
    vi.stubGlobal('Image', MockImage);
    const result = await validateBasemapSource({
      type: 'raster',
      url: 'https://tile.example/{z}/{x}/{y}.png',
    });
    expect(result).toEqual({ ok: true });
  });

  it('validateBasemapSource accepts vector style JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          sources: { s: { type: 'vector', tiles: [] } },
          layers: [{ id: 'l', type: 'background' }],
        }),
      }),
    );
    const result = await validateBasemapSource({
      type: 'vector',
      url: 'https://example.com/style.json',
    });
    expect(result).toEqual({ ok: true });
  });

  it('validateBasemapSource rejects invalid vector JSON shape', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ foo: 1 }),
      }),
    );
    const result = await validateBasemapSource({
      type: 'vector',
      url: 'https://example.com/style.json',
    });
    expect(result).toMatchObject({ ok: false, code: 'invalid-style' });
  });
});

describe('createCustomBasemapItem', () => {
  it('builds raster and vector items', () => {
    const raster = createCustomBasemapItem({
      title: ' My tiles ',
      type: 'raster',
      url: 'https://t.com/{z}/{x}/{y}.png',
      id: 'r1',
    });
    expect(raster).toMatchObject({
      id: 'r1',
      title: 'My tiles',
      type: 'raster',
      links: ['https://t.com/{z}/{x}/{y}.png'],
      custom: true,
    });

    const vector = createCustomBasemapItem({
      title: 'Style',
      type: 'vector',
      url: 'https://t.com/style.json',
      id: 'v1',
    });
    expect(vector).toMatchObject({
      id: 'v1',
      type: 'vector',
      links: ['https://t.com/style.json'],
      custom: true,
    });
  });

  it('isCustomBasemapItem detects custom flag and legacy ids', () => {
    expect(isCustomBasemapItem({ id: 'x', custom: true })).toBe(true);
    expect(isCustomBasemapItem({ id: 'custom-abc' })).toBe(true);
    expect(isCustomBasemapItem({ id: 'osm' })).toBe(false);
  });
});
