import { lookupProj4CrsItem } from '../crs/proj4-crs-catalog';
import {
  degToDms,
  degToDmsString,
  dmsToDeg,
  formatCoordinate,
  isCoordinatesNumber,
  latDMS,
  lngDMS,
  parseCoordinateListText,
  parseCoordinateText,
  toCoordinatesNumberList,
  transformWgs84ToCrs,
} from './coordinate';

describe('coordinate helpers', () => {
  it('filters complete coordinate pairs', () => {
    expect(isCoordinatesNumber([1, 2])).toBe(true);
    expect(isCoordinatesNumber([1, undefined as never])).toBe(false);
    expect(
      toCoordinatesNumberList([
        [1, 2],
        [3, undefined as never],
      ]),
    ).toEqual([[1, 2]]);
  });

  it('converts between degrees and DMS', () => {
    const dms = degToDms(21.5);
    expect(dms.deg).toBe(21);
    expect(dms.min).toBe(30);
    expect(Number(dmsToDeg(dms))).toBeCloseTo(21.5);
    expect(degToDmsString(21.5)).toContain('21');
    expect(latDMS(21)).toMatch(/N|S/);
    expect(lngDMS(105)).toMatch(/E|W/);
  });

  it('transforms WGS84 to Web Mercator meters', () => {
    const crs = lookupProj4CrsItem('3857');
    expect(crs?.unit).toBe('meter');
    const xy = transformWgs84ToCrs(105.405678, 21.722002, {
      name: 'Web Mercator',
      epsg: '3857',
      unit: 'meter',
      proj4js: crs?.proj4js,
    });
    expect(xy).not.toBeNull();
    expect(Math.abs(xy![0])).toBeGreaterThan(1_000_000);
    expect(Math.abs(xy![1])).toBeGreaterThan(1_000_000);

    const formatted = formatCoordinate(
      { longitude: 105.405678, latitude: 21.722002 },
      {
        name: 'Web Mercator',
        epsg: '3857',
        unit: 'meter',
        proj4js: crs?.proj4js,
      },
    );
    expect(Number(formatted.longitude)).toBeGreaterThan(1_000_000);
    expect(Number(formatted.latitude)).toBeGreaterThan(1_000_000);
  });

  it('parseCoordinateText supports decimal and DMS pairs', () => {
    expect(parseCoordinateText('105.5, 21.0')).toEqual({
      lng: 105.5,
      lat: 21,
      zoom: undefined,
    });
    expect(parseCoordinateText('21.0, 105.5')).toEqual({
      lng: 105.5,
      lat: 21,
      zoom: undefined,
    });
    expect(parseCoordinateText('105.5 21 zoom 12')?.zoom).toBe(12);
    const dms = parseCoordinateText('21°30\'0"N, 105°30\'0"E');
    expect(dms?.lat).toBeCloseTo(21.5, 4);
    expect(dms?.lng).toBeCloseTo(105.5, 4);
    expect(parseCoordinateText('')).toBeNull();
  });

  it('parseCoordinateText supports Google Maps lat,lng,zoomz', () => {
    expect(parseCoordinateText('20.9966508,105.8462597,21z')).toEqual({
      lat: 20.9966508,
      lng: 105.8462597,
      zoom: 21,
    });
    expect(parseCoordinateText('@20.9966508,105.8462597,15z')).toEqual({
      lat: 20.9966508,
      lng: 105.8462597,
      zoom: 15,
    });
    expect(parseCoordinateText('20.7314463,106.306864,8.96')).toEqual({
      lat: 20.7314463,
      lng: 106.306864,
      zoom: 8.96,
    });
  });

  it('parseCoordinateListText parses CSV / multi-line paste', () => {
    expect(
      parseCoordinateListText(`lng,lat
105.8,21.0
106.0,21.2
105.9,20.8`),
    ).toEqual([
      [105.8, 21],
      [106, 21.2],
      [105.9, 20.8],
    ]);
    expect(
      parseCoordinateListText('105.85\t21.03\n106.1\t21.15'),
    ).toEqual([
      [105.85, 21.03],
      [106.1, 21.15],
    ]);
    expect(parseCoordinateListText('105.5, 21.0')).toEqual([[105.5, 21]]);
    expect(parseCoordinateListText('')).toEqual([]);
  });
});
