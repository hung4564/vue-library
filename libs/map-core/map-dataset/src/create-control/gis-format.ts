export type GisFormat =
  | 'geojson'
  | 'geojsonl'
  | 'topojson'
  | 'kml'
  | 'kmz'
  | 'gpx'
  | 'shapefile'
  | 'csv'
  | 'wkt'
  | 'zip';

export const GIS_FILE_ACCEPT =
  '.geojson,.json,.geojsonl,.ndjson,.topojson,.kml,.kmz,.gpx,.zip,.shp,.dbf,.prj,.cpg,.csv,.wkt,.txt';

/** Text GIS formats that can live inside a .zip archive. */
export const ZIP_MEMBER_FORMATS = new Set<GisFormat>([
  'geojson',
  'geojsonl',
  'topojson',
  'kml',
  'gpx',
  'csv',
  'wkt',
  'kmz',
]);

const SHAPEFILE_SIDECARS = new Set([
  'shp',
  'dbf',
  'prj',
  'cpg',
  'shx',
  'sbn',
  'sbx',
  'qix',
  'qpj',
  'fix',
]);

export type GisSourceHint = {
  name?: string;
  type?: string;
};

export function fileExtension(name?: string): string {
  if (!name) return '';
  const base = name.split(/[?#]/)[0];
  const parts = base.split('.');
  if (parts.length < 2) return '';
  return parts.pop()!.toLowerCase();
}

export function detectGisFormat(
  hint: GisSourceHint & { text?: string } = {},
): GisFormat | null {
  const ext = fileExtension(hint.name);
  const mime = (hint.type || '').toLowerCase();

  switch (ext) {
    case 'geojson':
    case 'json':
      return hint.text?.includes('"type"') && hint.text.includes('Topology')
        ? 'topojson'
        : 'geojson';
    case 'geojsonl':
    case 'ndjson':
      return 'geojsonl';
    case 'topojson':
      return 'topojson';
    case 'kml':
      return 'kml';
    case 'kmz':
      return 'kmz';
    case 'gpx':
      return 'gpx';
    case 'zip':
      return 'zip';
    case 'shp':
    case 'dbf':
    case 'prj':
    case 'cpg':
      return 'shapefile';
    case 'csv':
    case 'tsv':
      return 'csv';
    case 'wkt':
      return 'wkt';
    default:
      break;
  }

  if (mime.includes('google-earth.kmz') || mime.includes('vnd.kmz')) return 'kmz';
  if (mime.includes('google-earth') || mime.includes('vnd.kml')) return 'kml';
  if (mime.includes('gpx')) return 'gpx';
  if (mime.includes('csv')) return 'csv';
  if (mime.includes('zip') || mime.includes('application/x-zip')) return 'zip';
  if (mime.includes('geo+json') || mime.includes('geojson')) return 'geojson';

  if (hint.text) return sniffGisText(hint.text);
  return null;
}

export function sniffGisText(text: string): GisFormat | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (trimmed[0] === '<') {
    const head = trimmed.slice(0, 400).toLowerCase();
    if (head.includes('<gpx') || head.includes('http://www.topografix.com/gpx')) {
      return 'gpx';
    }
    if (head.includes('<kml') || head.includes('opengis.net/kml')) {
      return 'kml';
    }
    return 'kml';
  }
  if (trimmed[0] === '{' || trimmed[0] === '[') {
    if (/"type"\s*:\s*"Topology"/i.test(trimmed.slice(0, 2000))) return 'topojson';
    return 'geojson';
  }
  if (/^(GEOMETRYCOLLECTION|MULTI(POINT|LINESTRING|POLYGON)|POINT|LINESTRING|POLYGON)\s*\(/i.test(
    trimmed,
  )) {
    return 'wkt';
  }
  const firstLine = trimmed.split(/\r?\n/, 1)[0] || '';
  if (firstLine.includes(',') && /lat|lon|lng|long|wkt|geom/i.test(firstLine)) {
    return 'csv';
  }
  if (isLikelyGeojsonl(trimmed)) return 'geojsonl';
  return null;
}

export function isShapefileSidecar(name?: string): boolean {
  return SHAPEFILE_SIDECARS.has(fileExtension(name));
}

export function isBinaryGisFormat(format: GisFormat | null): boolean {
  return format === 'shapefile' || format === 'kmz' || format === 'zip';
}

export function isIgnoredZipEntry(name: string): boolean {
  const normalized = name.replace(/\\/g, '/');
  if (
    normalized === '__MACOSX' ||
    normalized.startsWith('__MACOSX/') ||
    normalized.includes('/__MACOSX/')
  ) {
    return true;
  }
  const base = normalized.split('/').pop() || '';
  if (!base || base.startsWith('.') || base.startsWith('._')) return true;
  return base === 'Thumbs.db' || base === 'desktop.ini';
}

export function isZipMemberFormat(format: GisFormat | null): format is GisFormat {
  return !!format && ZIP_MEMBER_FORMATS.has(format);
}

function isLikelyGeojsonl(text: string): boolean {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return false;
  return lines.slice(0, 3).every((line) => line.startsWith('{') && line.endsWith('}'));
}
