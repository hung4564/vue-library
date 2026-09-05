import type {
  Feature,
  FeatureCollection,
  GeoJSON,
  Geometry,
  Position,
} from 'geojson';
import { kml, gpx } from '@tmcw/togeojson';
import { DOMParser } from '@xmldom/xmldom';
import JSZip from 'jszip';
import Papa from 'papaparse';
import shpjs from 'shpjs';
import { feature as topojsonFeature } from 'topojson-client';
import { detectGeojsonCrs, isValidGeojson, parseGeojsonText } from './geojson-parse';
import {
  detectGisFormat,
  fileExtension,
  isBinaryGisFormat,
  isIgnoredZipEntry,
  isShapefileSidecar,
  isZipMemberFormat,
  sniffGisText,
  type GisFormat,
  type GisSourceHint,
} from './gis-format';

export type GisProgress = (current: number, total?: number, message?: string) => void;

export type GisLoadResult = {
  geojson: GeoJSON | null;
  crs: string | null;
  format?: GisFormat;
};

const parseShapefile = shpjs as unknown as (
  input:
    | ArrayBuffer
    | Uint8Array
    | {
        shp: ArrayBuffer;
        dbf?: ArrayBuffer;
        prj?: ArrayBuffer;
        cpg?: ArrayBuffer;
      },
) => Promise<GeoJSON | GeoJSON[]>;
const LAT_KEYS = ['lat', 'latitude', 'y', 'latitud'];
const LNG_KEYS = ['lon', 'lng', 'long', 'longitude', 'x', 'longitud', 'lonlat'];
const WKT_KEYS = ['wkt', 'geom', 'geometry', 'the_geom', 'shape', 'wkb'];

export function asGisFeatureCollection(geojson: GeoJSON | null): FeatureCollection | null {
  if (!geojson) return null;
  if (geojson.type === 'FeatureCollection') return geojson;
  if (geojson.type === 'Feature') {
    return { type: 'FeatureCollection', features: [geojson] };
  }
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', geometry: geojson, properties: {} }],
  };
}

export function parseGisText(
  text: string,
  hint: GisSourceHint & { strict?: boolean } = {},
  report?: GisProgress,
): GisLoadResult {
  const trimmed = text.trim();
  if (!trimmed) return { geojson: null, crs: null };

  const format =
    detectGisFormat({ ...hint, text: trimmed }) ?? sniffGisText(trimmed);
  report?.(0, 1, format || 'parse');

  try {
    const result = parseTextByFormat(trimmed, format);
    report?.(1, 1, format || 'parse');
    return result;
  } catch (error) {
    if (hint.strict === false) return { geojson: null, crs: null };
    throw error;
  }
}

export async function parseGisFile(
  file: Blob & { name?: string; type?: string },
  report?: GisProgress,
): Promise<GisLoadResult> {
  const hint: GisSourceHint = { name: file.name, type: file.type };
  const format = detectGisFormat(hint);
  report?.(0, 2, 'read');

  if (isBinaryGisFormat(format) || fileExtension(file.name) === 'shp') {
    const buffer = await file.arrayBuffer();
    report?.(1, 2, format || 'parse');
    const result = await parseGisBuffer(buffer, hint, report);
    report?.(2, 2, result.format || 'parse');
    return result;
  }

  const text = await file.text();
  report?.(1, 2, format || 'parse');
  const result = parseGisText(text, { ...hint, strict: true }, report);
  report?.(2, 2, result.format || 'parse');
  return result;
}

export async function parseGisFiles(
  files: Array<Blob & { name?: string; type?: string }>,
  report?: GisProgress,
): Promise<GisLoadResult> {
  if (!files.length) return { geojson: null, crs: null };
  if (files.length === 1) return parseGisFile(files[0], report);

  const shapefileParts = files.filter((file) => isShapefileSidecar(file.name));
  if (shapefileParts.length === files.length && shapefileParts.some((file) => fileExtension(file.name) === 'shp')) {
    report?.(0, 2, 'shapefile');
    const result = await parseShapefileParts(shapefileParts, report);
    report?.(2, 2, 'shapefile');
    return result;
  }

  throw new Error(
    'Drop one GIS file, a Shapefile set (.shp/.dbf/.prj), or a .zip / .kmz archive',
  );
}

export async function parseGisFromUrl(
  url: string,
  report?: GisProgress,
): Promise<GisLoadResult> {
  report?.(0, 2, 'fetch');
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch GIS data (${response.status})`);
  }

  const filename =
    filenameFromContentDisposition(response.headers.get('content-disposition')) ||
    filenameFromUrl(url) ||
    'download';
  const contentType = response.headers.get('content-type') || '';
  const hint: GisSourceHint = { name: filename, type: contentType };
  const format = detectGisFormat(hint);
  if (isBinaryGisFormat(format) || fileExtension(filename) === 'shp') {
    const buffer = await response.arrayBuffer();
    report?.(1, 2, format || 'parse');
    const result = await parseGisBuffer(buffer, hint, report);
    report?.(2, 2, result.format || 'parse');
    return result;
  }

  const text = await response.text();
  report?.(1, 2, format || 'parse');
  return parseGisText(text, { ...hint, strict: true }, report);
}

export async function parseGisBuffer(
  buffer: ArrayBuffer,
  hint: GisSourceHint = {},
  report?: GisProgress,
): Promise<GisLoadResult> {
  const format = detectGisFormat(hint);
  const ext = fileExtension(hint.name);
  if (format === 'kmz' || ext === 'kmz') {
    return parseKmzBuffer(buffer, report);
  }
  if (format === 'zip' || ext === 'zip') {
    return parseZipArchive(buffer, report);
  }
  if (format === 'shapefile' || ext === 'shp') {
    return parseShapefileParts([{ name: hint.name, buffer }], report);
  }
  const text = new TextDecoder().decode(buffer);
  return parseGisText(text, { ...hint, strict: true }, report);
}

function parseTextByFormat(text: string, format: GisFormat | null): GisLoadResult {
  switch (format) {
    case 'topojson':
      return wrap(parseTopojson(text), 'topojson', '4326');
    case 'kml':
      return wrap(xmlToGeojson(text, 'kml'), 'kml', '4326');
    case 'gpx':
      return wrap(xmlToGeojson(text, 'gpx'), 'gpx', '4326');
    case 'csv':
      return wrap(parseCsv(text), 'csv', '4326');
    case 'wkt':
      return wrap(wktToGeojson(text), 'wkt', '4326');
    case 'geojsonl':
      return wrap(parseGeojsonl(text), 'geojsonl');
    case 'shapefile':
    case 'zip':
    case 'kmz':
      throw new Error('Binary GIS formats cannot be parsed as text');
    case 'geojson':
    case null:
      return parseJsonOrFallback(text);
    default:
      throw new Error('Unsupported GIS format');
  }
}

function parseJsonOrFallback(text: string): GisLoadResult {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (isTopojson(parsed)) {
      return wrap(topojsonToCollection(parsed), 'topojson', '4326');
    }
    if (isValidGeojson(parsed)) {
      return wrap(parsed, 'geojson');
    }
  } catch {
    // try other text formats
  }
  const sniffed = sniffGisText(text);
  if (sniffed && sniffed !== 'geojson') {
    return parseTextByFormat(text, sniffed);
  }
  const geojson = parseGeojsonText(text);
  if (!geojson) throw new Error('Unsupported or invalid GIS data');
  return wrap(geojson, 'geojson');
}

function wrap(
  geojson: GeoJSON | null,
  format: GisFormat,
  crsHint?: string | null,
): GisLoadResult {
  if (!geojson) return { geojson: null, crs: crsHint ?? null, format };
  const crs = detectGeojsonCrs(geojson) ?? crsHint ?? null;
  return { geojson, crs, format };
}

function isTopojson(value: unknown): value is {
  type: 'Topology';
  objects: Record<string, unknown>;
} {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as { type?: string }).type === 'Topology' &&
    !!(value as { objects?: unknown }).objects
  );
}

function parseTopojson(text: string): FeatureCollection {
  const parsed = JSON.parse(text) as unknown;
  if (!isTopojson(parsed)) throw new Error('Invalid TopoJSON');
  return topojsonToCollection(parsed);
}

function topojsonToCollection(topology: {
  type: 'Topology';
  objects: Record<string, unknown>;
}): FeatureCollection {
  const features: Feature[] = [];
  for (const key of Object.keys(topology.objects)) {
    const converted = topojsonFeature(
      topology as never,
      topology.objects[key] as never,
    ) as Feature | FeatureCollection;
    if (converted.type === 'FeatureCollection') {
      features.push(...converted.features);
    } else {
      features.push(converted);
    }
  }
  return { type: 'FeatureCollection', features };
}

function xmlToGeojson(text: string, kind: 'kml' | 'gpx'): FeatureCollection {
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  const converted = kind === 'gpx' ? gpx(doc) : kml(doc);
  return asGisFeatureCollection(converted as GeoJSON) ?? {
    type: 'FeatureCollection',
    features: [],
  };
}

async function parseKmzBuffer(
  buffer: ArrayBuffer,
  report?: GisProgress,
): Promise<GisLoadResult> {
  report?.(1, 2, 'kmz');
  const zip = await JSZip.loadAsync(buffer);
  const kmlFile = Object.values(zip.files).find(
    (entry) =>
      !entry.dir &&
      !isIgnoredZipEntry(entry.name) &&
      entry.name.toLowerCase().endsWith('.kml'),
  );
  if (!kmlFile) throw new Error('KMZ archive does not contain a KML file');
  const text = await kmlFile.async('string');
  return wrap(xmlToGeojson(text, 'kml'), 'kmz', '4326');
}

/**
 * Open a `.zip` that may contain Shapefile parts and/or GeoJSON, KML, GPX, CSV, …
 */
async function parseZipArchive(
  buffer: ArrayBuffer,
  report?: GisProgress,
): Promise<GisLoadResult> {
  report?.(1, 2, 'zip');
  const zip = await JSZip.loadAsync(buffer);
  const entries = Object.values(zip.files).filter(
    (entry) => !entry.dir && !isIgnoredZipEntry(entry.name),
  );

  if (entries.some((entry) => fileExtension(entry.name) === 'shp')) {
    try {
      const parsed = await parseShapefile(buffer);
      return wrap(normalizeShapefile(parsed), 'shapefile', '4326');
    } catch {
      try {
        return await parseShapefileParts(
          await Promise.all(
            entries
              .filter((entry) => isShapefileSidecar(entry.name))
              .map(async (entry) => ({
                name: entry.name,
                buffer: await entry.async('arraybuffer'),
              })),
          ),
          report,
        );
      } catch {
        // Mixed or non-standard zips: fall through and parse loose members.
      }
    }
  }

  const results: GisLoadResult[] = [];
  for (const entry of entries) {
    const format = detectGisFormat({ name: entry.name });
    if (!isZipMemberFormat(format)) continue;

    try {
      if (format === 'kmz') {
        const nested = await parseKmzBuffer(
          await entry.async('arraybuffer'),
          report,
        );
        if (nested.geojson) results.push(nested);
        continue;
      }

      const text = await entry.async('string');
      const parsed = parseGisText(text, { name: entry.name, strict: true });
      if (parsed.geojson) results.push(parsed);
    } catch {
      // Skip unreadable members; other files in the archive may still load.
    }
  }

  if (!results.length) {
    throw new Error(
      'ZIP has no supported GIS data (GeoJSON, KML, GPX, TopoJSON, CSV, WKT, or Shapefile)',
    );
  }

  return mergeGisResults(results);
}

function mergeGisResults(results: GisLoadResult[]): GisLoadResult {
  if (results.length === 1) {
    return { ...results[0], format: results[0].format || 'zip' };
  }

  const features: Feature[] = [];
  const formats = new Set<GisFormat>();
  let crs: string | null = null;

  for (const result of results) {
    const collection = asGisFeatureCollection(result.geojson);
    if (collection) features.push(...collection.features);
    if (result.format) formats.add(result.format);
    if (!crs && result.crs) crs = result.crs;
  }

  const format =
    formats.size === 1 ? [...formats][0] : ('zip' as GisFormat);

  return wrap(
    { type: 'FeatureCollection', features },
    format,
    crs,
  );
}

async function parseShapefileParts(
  files: Array<{ name?: string; buffer?: ArrayBuffer; arrayBuffer?: () => Promise<ArrayBuffer> }>,
  report?: GisProgress,
): Promise<GisLoadResult> {
  report?.(1, 2, 'shapefile');
  const parts: Record<string, ArrayBuffer | undefined> = {};
  for (const file of files) {
    const ext = fileExtension(file.name);
    const buffer =
      file.buffer ??
      (file.arrayBuffer ? await file.arrayBuffer() : undefined);
    if (!buffer || !ext) continue;
    parts[ext] = buffer;
  }
  if (!parts['shp']) throw new Error('Shapefile is missing the .shp file');
  const parsed = await parseShapefile({
    shp: parts['shp'],
    dbf: parts['dbf'],
    prj: parts['prj'],
    cpg: parts['cpg'],
  });
  return wrap(normalizeShapefile(parsed), 'shapefile', '4326');
}

function normalizeShapefile(parsed: GeoJSON | GeoJSON[]): FeatureCollection {
  const collections = (Array.isArray(parsed) ? parsed : [parsed])
    .map((item) => asGisFeatureCollection(item))
    .filter((item): item is FeatureCollection => !!item);
  if (!collections.length) {
    return { type: 'FeatureCollection', features: [] };
  }
  if (collections.length === 1) return collections[0];
  return {
    type: 'FeatureCollection',
    features: collections.flatMap((item) => item.features),
  };
}

function parseCsv(text: string): FeatureCollection {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  const headers = parsed.meta.fields ?? [];
  if (!headers.length) throw new Error('CSV has no header row');

  const latKey = findHeader(headers, LAT_KEYS);
  const lngKey = findHeader(headers, LNG_KEYS);
  const wktKey = findHeader(headers, WKT_KEYS);
  if (!wktKey && !(latKey && lngKey)) {
    throw new Error('CSV needs latitude/longitude columns or a WKT/geometry column');
  }

  const features: Feature[] = [];
  for (const row of parsed.data) {
    try {
      const geometry = wktKey
        ? parseWktGeometry(String(row[wktKey] ?? ''))
        : {
            type: 'Point' as const,
            coordinates: [
              Number(row[lngKey as string]),
              Number(row[latKey as string]),
            ],
          };
      if (
        geometry.type === 'Point' &&
        (!Number.isFinite(geometry.coordinates[0]) ||
          !Number.isFinite(geometry.coordinates[1]))
      ) {
        continue;
      }
      const properties = { ...row };
      if (latKey) delete properties[latKey];
      if (lngKey) delete properties[lngKey];
      if (wktKey) delete properties[wktKey];
      features.push({ type: 'Feature', geometry, properties });
    } catch {
      // skip invalid rows
    }
  }
  if (!features.length) throw new Error('CSV did not contain valid coordinates');
  return { type: 'FeatureCollection', features };
}

function findHeader(headers: string[], aliases: string[]): string | undefined {
  const lower = headers.map((header) => header.toLowerCase().replace(/[^a-z]/g, ''));
  for (const alias of aliases) {
    const index = lower.indexOf(alias);
    if (index >= 0) return headers[index];
  }
  return undefined;
}

function parseGeojsonl(text: string): FeatureCollection {
  const features: Feature[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parsed = JSON.parse(trimmed) as GeoJSON;
    if (parsed.type === 'Feature') features.push(parsed);
    else if (parsed.type === 'FeatureCollection') features.push(...parsed.features);
    else if (isValidGeojson(parsed) && 'coordinates' in parsed) {
      features.push({
        type: 'Feature',
        geometry: parsed as Geometry,
        properties: {},
      });
    }
  }
  if (!features.length) throw new Error('Invalid GeoJSON Lines');
  return { type: 'FeatureCollection', features };
}

function wktToGeojson(text: string): GeoJSON {
  const geometry = parseWktGeometry(text);
  return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry, properties: {} }] };
}

function parseWktGeometry(text: string, depth = 0): Geometry {
  if (depth > 32) throw new Error('WKT is too deeply nested');
  const src = text.trim().replace(/;\s*$/, '');
  const match = src.match(/^([A-Z]+)\s*(?:[ZM]{1,2})?\s*(\([\s\S]+\))$/i);
  if (!match) throw new Error('Invalid WKT');
  const type = match[1].toUpperCase();
  const inner = stripOuterParens(match[2]);

  switch (type) {
    case 'POINT':
      return { type: 'Point', coordinates: parseWktPosition(inner) };
    case 'MULTIPOINT':
      return { type: 'MultiPoint', coordinates: parseWktPositionList(inner) };
    case 'LINESTRING':
      return { type: 'LineString', coordinates: parseWktPositionList(inner) };
    case 'MULTILINESTRING':
      return { type: 'MultiLineString', coordinates: parseWktRingList(inner) };
    case 'POLYGON':
      return { type: 'Polygon', coordinates: parseWktRingList(inner) };
    case 'MULTIPOLYGON':
      return {
        type: 'MultiPolygon',
        coordinates: splitWktArgs(inner).map((part) =>
          parseWktRingList(stripOuterParens(part)),
        ),
      };
    case 'GEOMETRYCOLLECTION':
      return {
        type: 'GeometryCollection',
        geometries: splitWktArgs(inner).map((part) => {
          if (part === src) throw new Error('Invalid WKT GeometryCollection');
          return parseWktGeometry(part, depth + 1);
        }),
      };
    default:
      throw new Error(`Unsupported WKT type: ${type}`);
  }
}

function stripOuterParens(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function parseWktPosition(text: string): Position {
  const nums = stripOuterParens(text).split(/\s+/).map(Number);
  if (nums.length < 2 || nums.some((value) => !Number.isFinite(value))) {
    throw new Error(`Invalid WKT coordinate: ${text}`);
  }
  return nums;
}

function parseWktPositionList(text: string): Position[] {
  return splitWktArgs(text).map((part) => parseWktPosition(part));
}

function parseWktRingList(text: string): Position[][] {
  return splitWktArgs(text).map((part) =>
    parseWktPositionList(stripOuterParens(part)),
  );
}

function splitWktArgs(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    else if (ch === ',' && depth === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts.filter(Boolean);
}

function filenameFromUrl(url: string): string {
  try {
    const path = new URL(url, 'http://local.invalid').pathname;
    return decodeURIComponent(path.split('/').pop() || '');
  } catch {
    return url.split('/').pop() || '';
  }
}

function filenameFromContentDisposition(header: string | null): string {
  if (!header) return '';
  const star = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (star?.[1]) return decodeURIComponent(star[1].trim());
  const plain = header.match(/filename="?([^";]+)"?/i);
  return plain?.[1]?.trim() || '';
}
