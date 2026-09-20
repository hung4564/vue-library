import { getUUIDv4 } from '@hungpvq/shared';

export type VectorTileArchiveKind = 'mbtiles' | 'pmtiles';

/** MapLibre custom protocol id (internal — registered by ensureVectorTileProtocols). */
const MBTILES_LOCAL_PROTOCOL = 'mbtiles-local';
const PMTILES_LOCAL_PROTOCOL = 'pmtiles-local';

export type VectorTileArchiveTileKind = 'vector' | 'raster';

/** One TileJSON / MBTiles `vector_layers` entry (+ optional tilestats geometry). */
export type VectorTileSourceLayerInfo = {
  id: string;
  description?: string;
  /** Attribute name → type/description from TileJSON `fields`. */
  fields?: Record<string, string>;
  /** Geometry type(s) from `tilestats` when present (e.g. Polygon). */
  geometryTypes?: string[];
  minzoom?: number;
  maxzoom?: number;
};

export type VectorTileArchiveMeta = {
  archiveId: string;
  kind: VectorTileArchiveKind;
  /** Vector MVT vs raster image tiles. */
  tileKind: VectorTileArchiveTileKind;
  bounds?: [number, number, number, number];
  minzoom?: number;
  maxzoom?: number;
  /** All MapLibre source-layer ids from TileJSON / MBTiles `vector_layers`. */
  sourceLayers: string[];
  /** Rich metadata per source-layer (fields, geometry) when available. */
  sourceLayerInfos?: VectorTileSourceLayerInfo[];
  /** First source-layer id (compat). */
  sourceLayer?: string;
  name?: string;
  /** Raw format string from MBTiles metadata when present. */
  format?: string;
};

export type VectorTileOpenResult = VectorTileArchiveMeta & {
  tiles: string[];
};

type ArchiveEntry =
  | {
      kind: 'mbtiles';
      db: {
        exec: (sql: string) => { values?: unknown[][] }[];
        close?: () => void;
      };
      meta: VectorTileArchiveMeta;
    }
  | {
      kind: 'pmtiles';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pmtiles: { getZxy: (z: number, x: number, y: number) => Promise<any> };
      meta: VectorTileArchiveMeta;
    };

const archives = new Map<string, ArchiveEntry>();

const RASTER_FORMATS = new Set(['png', 'jpg', 'jpeg', 'webp']);
const VECTOR_FORMATS = new Set(['pbf', 'mvt']);

/** `mbtiles-local://{archiveId}/{z}/{x}/{y}` for CreateControl MBTiles open. */
export function mbtilesLocalTilesUrl(archiveId: string): string {
  return `${MBTILES_LOCAL_PROTOCOL}://${archiveId}/{z}/{x}/{y}`;
}

/** `pmtiles-local://{archiveId}/{z}/{x}/{y}` for CreateControl PMTiles open. */
export function pmtilesLocalTilesUrl(archiveId: string): string {
  return `${PMTILES_LOCAL_PROTOCOL}://${archiveId}/{z}/{x}/{y}`;
}

type LocalProtocolLoader = (
  params: { url: string },
) => Promise<{ data: ArrayBuffer | Uint8Array }>;

/** Register MapLibre custom protocols (ids stay package-internal). */
export function registerVectorTileLocalProtocols(
  addProtocol: (protocol: string, load: LocalProtocolLoader) => void,
  load: LocalProtocolLoader,
): void {
  for (const protocol of [
    MBTILES_LOCAL_PROTOCOL,
    PMTILES_LOCAL_PROTOCOL,
  ] as const) {
    try {
      addProtocol(protocol, load);
    } catch {
      // Already registered in this process.
    }
  }
}

function parseBounds(raw: string | undefined): [number, number, number, number] | undefined {
  if (!raw) return undefined;
  try {
    const arr = JSON.parse(raw) as number[];
    if (Array.isArray(arr) && arr.length >= 4) {
      return [arr[0], arr[1], arr[2], arr[3]];
    }
  } catch {
    const parts = raw.split(',').map(Number);
    if (parts.length >= 4 && parts.every((n) => Number.isFinite(n))) {
      return [parts[0], parts[1], parts[2], parts[3]];
    }
  }
  return undefined;
}

/**
 * Parse TileJSON / MBTiles metadata `vector_layers` (+ optional `tilestats`)
 * into rich source-layer infos for CreateControl.
 */
export function parseVectorLayerInfosFromJson(
  json: string | undefined,
): VectorTileSourceLayerInfo[] {
  if (!json?.trim()) return [];
  try {
    return parseVectorLayerInfosFromObject(JSON.parse(json) as unknown);
  } catch {
    return [];
  }
}

/** Parse vector layer infos from a TileJSON / PMTiles metadata object. */
export function parseVectorLayerInfosFromObject(
  metadata: unknown,
): VectorTileSourceLayerInfo[] {
  if (!metadata || typeof metadata !== 'object') return [];
  const root = metadata as {
    vector_layers?: Array<{
      id?: string;
      description?: string;
      fields?: Record<string, unknown>;
      minzoom?: number;
      maxzoom?: number;
      geometry?: string;
      geometry_type?: string;
    }>;
    tilestats?: {
      layers?: Array<{
        layer?: string;
        geometry?: string;
        geometries?: string[];
      }>;
    };
  };

  const geometryById = new Map<string, string[]>();
  for (const layer of root.tilestats?.layers ?? []) {
    const id = layer.layer?.trim();
    if (!id) continue;
    const types = new Set<string>();
    if (layer.geometry?.trim()) types.add(layer.geometry.trim());
    for (const g of layer.geometries ?? []) {
      if (g?.trim()) types.add(g.trim());
    }
    if (types.size) geometryById.set(id, [...types].sort());
  }

  const infos: VectorTileSourceLayerInfo[] = [];
  for (const layer of root.vector_layers ?? []) {
    const id = layer.id?.trim();
    if (!id) continue;
    const fields = normalizeLayerFields(layer.fields);
    const fromLayer =
      layer.geometry?.trim() || layer.geometry_type?.trim() || undefined;
    const geometryTypes =
      geometryById.get(id) ?? (fromLayer ? [fromLayer] : undefined);
    infos.push({
      id,
      description: layer.description?.trim() || undefined,
      fields: fields && Object.keys(fields).length ? fields : undefined,
      geometryTypes,
      minzoom: layer.minzoom,
      maxzoom: layer.maxzoom,
    });
  }
  return infos;
}

function normalizeLayerFields(
  fields: Record<string, unknown> | undefined,
): Record<string, string> | undefined {
  if (!fields || typeof fields !== 'object') return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const name = key.trim();
    if (!name) continue;
    out[name] = value == null ? '' : String(value);
  }
  return out;
}

function resolveMbtilesTileKind(
  formatRaw: string | undefined,
  sourceLayers: string[],
): VectorTileArchiveTileKind {
  const format = (formatRaw ?? '').trim().toLowerCase();
  if (VECTOR_FORMATS.has(format)) return 'vector';
  if (RASTER_FORMATS.has(format)) return 'raster';
  if (sourceLayers.length) return 'vector';
  if (format) return 'raster';
  throw new Error(
    'MBTiles metadata missing format / vector_layers; cannot detect vector vs raster.',
  );
}

/** Exported for unit tests. */
export function metaFromMbtilesRows(
  archiveId: string,
  rows: { name: string; value: string }[],
): VectorTileArchiveMeta {
  const map = new Map(rows.map((r) => [r.name, r.value]));
  const sourceLayerInfos = parseVectorLayerInfosFromJson(map.get('json'));
  const sourceLayers = sourceLayerInfos.map((l) => l.id);
  const format = map.get('format');
  const tileKind = resolveMbtilesTileKind(format, sourceLayers);
  const minzoom = map.get('minzoom');
  const maxzoom = map.get('maxzoom');
  return {
    archiveId,
    kind: 'mbtiles',
    tileKind,
    format,
    name: map.get('name'),
    bounds: parseBounds(map.get('bounds')),
    minzoom: minzoom != null ? Number(minzoom) : undefined,
    maxzoom: maxzoom != null ? Number(maxzoom) : undefined,
    sourceLayers: tileKind === 'vector' ? sourceLayers : [],
    sourceLayerInfos: tileKind === 'vector' ? sourceLayerInfos : [],
    sourceLayer: tileKind === 'vector' ? sourceLayers[0] : undefined,
  };
}

const SQL_JS_CDN = 'https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist';

type InitSqlJs = (opts?: {
  locateFile?: (file: string) => string;
}) => Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Database: new (data?: ArrayLike<number> | Buffer) => any;
}>;

let sqlJsPromise: Promise<Awaited<ReturnType<InitSqlJs>>> | null = null;

function resolveInitSqlJs(mod: unknown): InitSqlJs | null {
  if (typeof mod === 'function') return mod as InitSqlJs;
  if (!mod || typeof mod !== 'object') return null;
  const record = mod as Record<string, unknown>;
  for (const key of ['default', 'Module', 'initSqlJs'] as const) {
    const value = record[key];
    if (typeof value === 'function') return value as InitSqlJs;
    if (value && typeof value === 'object') {
      const nested = value as Record<string, unknown>;
      if (typeof nested['default'] === 'function') {
        return nested['default'] as InitSqlJs;
      }
      if (typeof nested['Module'] === 'function') {
        return nested['Module'] as InitSqlJs;
      }
    }
  }
  return null;
}

async function loadSqlJs(): Promise<Awaited<ReturnType<InitSqlJs>>> {
  if (!sqlJsPromise) {
    sqlJsPromise = (async () => {
      // Spec as string so consumers need no `@types/sql.js` / ambient module.
      const sqlJsSpec = 'sql.js';
      let init = resolveInitSqlJs(
        await import(/* @vite-ignore */ sqlJsSpec).catch(() => null),
      );

      if (!init) {
        // Vite CJS interop often fails — evaluate the shipped CJS build from CDN.
        const src = `${SQL_JS_CDN}/sql-wasm.js`;
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(
            `MBTiles requires optional peer \`sql.js\` (failed CDN ${src}: ${response.status})`,
          );
        }
        const module = { exports: {} as Record<string, unknown> };
        // eslint-disable-next-line no-new-func -- sql.js ships CJS
        const run = new Function(
          'module',
          'exports',
          `${await response.text()}\n;return module.exports;`,
        );
        init =
          resolveInitSqlJs(run(module, module.exports)) ??
          resolveInitSqlJs(module.exports);
      }

      if (!init) {
        throw new Error(
          'MBTiles requires optional peer `sql.js`. Install it in the app to open .mbtiles files.',
        );
      }

      return init({
        locateFile: (file: string) => `${SQL_JS_CDN}/${file}`,
      });
    })().catch((error) => {
      sqlJsPromise = null;
      throw error;
    });
  }
  return sqlJsPromise;
}

async function loadPMTiles(): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PMTiles: new (source: any) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FileSource: new (file: File) => any;
}> {
  try {
    // Spec as string keeps optional-peer typing local (pmtiles FileSource is File-only).
    const pmtilesSpec = 'pmtiles';
    const mod = (await import(/* @vite-ignore */ pmtilesSpec)) as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      PMTiles: new (source: any) => any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      FileSource: new (file: File) => any;
    };
    return {
      PMTiles: mod.PMTiles,
      FileSource: mod.FileSource,
    };
  } catch {
    throw new Error(
      'PMTiles requires optional peer `pmtiles`. Install it in the app to open .pmtiles URLs/files.',
    );
  }
}

async function maybeGunzip(data: Uint8Array): Promise<ArrayBuffer> {
  const plain = uint8ToArrayBuffer(data);
  if (!(data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b)) {
    return plain;
  }
  if (typeof DecompressionStream === 'undefined') {
    return plain;
  }
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).arrayBuffer();
}

/** Copy a view into a detached `ArrayBuffer` (avoids `ArrayBufferLike` / SharedArrayBuffer). */
function uint8ToArrayBuffer(data: Uint8Array): ArrayBuffer {
  const out = new ArrayBuffer(data.byteLength);
  new Uint8Array(out).set(data);
  return out;
}

export async function openMbtilesFromBuffer(
  buffer: ArrayBuffer,
  archiveId = getUUIDv4(),
): Promise<VectorTileOpenResult> {
  const SQL = await loadSqlJs();
  const db = new SQL.Database(new Uint8Array(buffer));
  const result = db.exec('SELECT name, value FROM metadata');
  const rows: { name: string; value: string }[] = [];
  if (result[0]?.values) {
    for (const row of result[0].values) {
      rows.push({ name: String(row[0]), value: String(row[1]) });
    }
  }
  const meta = metaFromMbtilesRows(archiveId, rows);
  archives.set(archiveId, { kind: 'mbtiles', db, meta });
  return {
    ...meta,
    tiles: [mbtilesLocalTilesUrl(archiveId)],
  };
}

/** PMTiles header tileType: 1=mvt, 2=png, 3=jpeg, 4=webp, 5=avif (pmtiles v3). */
function tileKindFromPmtilesTileType(
  tileType: number | undefined,
): VectorTileArchiveTileKind {
  if (
    tileType === 2 ||
    tileType === 3 ||
    tileType === 4 ||
    tileType === 5
  ) {
    return 'raster';
  }
  // Unknown / missing / mvt → vector (CreateControl needs paint layers).
  return 'vector';
}

function formatFromPmtilesTileType(tileType: number | undefined): string | undefined {
  switch (tileType) {
    case 1:
      return 'mvt';
    case 2:
      return 'png';
    case 3:
      return 'jpeg';
    case 4:
      return 'webp';
    case 5:
      return 'avif';
    default:
      return undefined;
  }
}

async function openPmtilesInstance(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pmtiles: {
    source: { getKey: () => string };
    getHeader: () => Promise<any>;
    getMetadata: () => Promise<unknown>;
    getZxy: (...args: any[]) => Promise<any>;
  },
  archiveId: string,
): Promise<VectorTileOpenResult> {
  const header = await pmtiles.getHeader();
  let sourceLayerInfos: VectorTileSourceLayerInfo[] = [];
  let name: string | undefined;
  try {
    const metadata = await pmtiles.getMetadata();
    sourceLayerInfos = parseVectorLayerInfosFromObject(metadata);
    if ((metadata as { name?: string })?.name) {
      name = (metadata as { name?: string }).name;
    }
  } catch {
    /* metadata optional */
  }
  const sourceLayers = sourceLayerInfos.map((l) => l.id);
  const tileKind = tileKindFromPmtilesTileType(header.tileType);
  const format = formatFromPmtilesTileType(header.tileType);
  // Custom local protocol serves tiles via {@link getArchiveTile}.
  const meta: VectorTileArchiveMeta = {
    archiveId,
    kind: 'pmtiles',
    tileKind,
    format,
    minzoom: header.minZoom,
    maxzoom: header.maxZoom,
    bounds: [
      header.minLon,
      header.minLat,
      header.maxLon,
      header.maxLat,
    ],
    sourceLayers: tileKind === 'vector' ? sourceLayers : [],
    sourceLayerInfos: tileKind === 'vector' ? sourceLayerInfos : [],
    sourceLayer: tileKind === 'vector' ? sourceLayers[0] : undefined,
    name,
  };
  archives.set(archiveId, { kind: 'pmtiles', pmtiles, meta });
  return {
    ...meta,
    tiles: [pmtilesLocalTilesUrl(archiveId)],
  };
}

export async function openPmtilesFromUrl(
  url: string,
  archiveId = getUUIDv4(),
): Promise<VectorTileOpenResult> {
  const { PMTiles } = await loadPMTiles();
  return openPmtilesInstance(new PMTiles(url), archiveId);
}

/**
 * Open a local PMTiles buffer/file via {@link FileSource} (byte-range safe).
 * Avoids `blob:` Object URLs — FetchSource Range requests often fail there,
 * which yields empty tiles and a blank map.
 *
 * Always renames to `{archiveId}.pmtiles` so FileSource keys stay unique.
 */
export async function openPmtilesFromBuffer(
  buffer: ArrayBuffer | Blob,
  archiveId = getUUIDv4(),
): Promise<VectorTileOpenResult> {
  const { PMTiles, FileSource } = await loadPMTiles();
  const blob =
    buffer instanceof Blob ? buffer : new Blob([buffer], { type: 'application/vnd.pmtiles' });
  const file = new File([blob], `${archiveId}.pmtiles`, {
    type: 'application/vnd.pmtiles',
  });
  return openPmtilesInstance(new PMTiles(new FileSource(file)), archiveId);
}

export function closeArchive(archiveId: string): void {
  const entry = archives.get(archiveId);
  if (!entry) return;
  if (entry.kind === 'mbtiles') {
    entry.db.close?.();
  }
  archives.delete(archiveId);
}

export function getArchiveMeta(
  archiveId: string,
): VectorTileArchiveMeta | undefined {
  return archives.get(archiveId)?.meta;
}

/** TMS row for MBTiles: flip Y from XYZ. */
function xyzToTmsRow(z: number, y: number): number {
  return (1 << z) - 1 - y;
}

export async function getArchiveTile(
  archiveId: string,
  z: number,
  x: number,
  y: number,
): Promise<ArrayBuffer | null> {
  const entry = archives.get(archiveId);
  if (!entry) return null;

  if (entry.kind === 'mbtiles') {
    const tmsY = xyzToTmsRow(z, y);
    const result = entry.db.exec(
      `SELECT tile_data FROM tiles WHERE zoom_level=${z} AND tile_column=${x} AND tile_row=${tmsY} LIMIT 1`,
    );
    const cell = result[0]?.values?.[0]?.[0];
    if (!cell) return null;
    const bytes =
      cell instanceof Uint8Array
        ? cell
        : new Uint8Array(cell as ArrayBuffer);
    return maybeGunzip(bytes);
  }

  const tile = await entry.pmtiles.getZxy(z, x, y);
  if (!tile?.data) return null;
  const data =
    tile.data instanceof Uint8Array
      ? tile.data
      : new Uint8Array(tile.data as ArrayBuffer);
  return maybeGunzip(data);
}

export function parseVectorTileProtocolUrl(url: string): {
  archiveId: string;
  z: number;
  x: number;
  y: number;
} | null {
  const match =
    /^(?:mbtiles-local|pmtiles-local):\/\/([^/]+)\/(\d+)\/(\d+)\/(\d+)/.exec(
      url,
    );
  if (!match) return null;
  return {
    archiveId: decodeURIComponent(match[1]),
    z: Number(match[2]),
    x: Number(match[3]),
    y: Number(match[4]),
  };
}

/** Build CreateControl checkbox options from archive meta (all enabled). */
export function sourceLayerOptionsFromMeta(
  meta: Pick<
    VectorTileArchiveMeta,
    'sourceLayers' | 'sourceLayerInfos' | 'tileKind'
  >,
): Array<{
  id: string;
  enabled: boolean;
  fields?: Record<string, string>;
  geometryTypes?: string[];
  description?: string;
}> {
  if (meta.tileKind !== 'vector') return [];
  const infos: VectorTileSourceLayerInfo[] = meta.sourceLayerInfos?.length
    ? meta.sourceLayerInfos
    : meta.sourceLayers.map((id) => ({ id }));
  return infos.map((info) => ({
    id: info.id,
    enabled: true,
    fields: info.fields,
    geometryTypes: info.geometryTypes,
    description: info.description,
  }));
}
