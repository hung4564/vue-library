import { describe, expect, it } from 'vitest';
import {
  formatCrsLabel,
  lookupCrsItem,
  normalizeEpsgCode,
  resolveCrsDisplayItems,
  searchCrsCatalog,
} from './crs-catalog';
import { lookupProj4CrsItem } from './proj4-crs-catalog';

describe('crs-catalog', () => {
  it('normalizeEpsgCode strips EPSG: prefix', () => {
    expect(normalizeEpsgCode('EPSG:4326')).toBe('4326');
    expect(normalizeEpsgCode('4326')).toBe('4326');
    expect(normalizeEpsgCode('')).toBeNull();
  });

  it('lookupCrsItem finds WGS84', () => {
    const item = lookupCrsItem('4326');
    expect(item?.epsg).toBe('4326');
    expect(formatCrsLabel(item!)).toContain('4326');
  });

  it('resolveCrsDisplayItems marks 4326 as default and dedupes', () => {
    const items = resolveCrsDisplayItems(['4326', 'EPSG:4326', '3857']);
    expect(items[0].epsg).toBe('4326');
    expect(items[0].default).toBe(true);
    expect(items.map((i) => i.epsg)).toEqual(['4326', '3857']);
  });

  it('searchCrsCatalog filters by query', () => {
    const catalog = resolveCrsDisplayItems(['4326', '3857']);
    expect(searchCrsCatalog(catalog, '4326').map((i) => i.epsg)).toEqual([
      '4326',
    ]);
  });
});

describe('proj4-crs-catalog', () => {
  it('lookupProj4CrsItem resolves common codes', () => {
    const item = lookupProj4CrsItem('3857');
    expect(item?.epsg).toBe('3857');
    expect(item?.proj4js).toBeTruthy();
  });
});
