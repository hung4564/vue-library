import { WorkerMonitor, workerProgressRatio } from '@hungpvq/map-core';
import type { GeoJSON } from 'geojson';
import { loadGisFileAsync, loadGisTextAsync, loadGisUrlAsync } from '../geojson/geojson-worker.client';
import { parseVectorLayerInfosFromObject } from '../vector-tile/archives';
import type { VectorTileSourceLayerInfo } from '../vector-tile/archives';
import { applyCreateControlSample } from './apply-sample';
import type { GisFormat } from './gis-format';
import { formatCreateControlBytes } from './limits';
import {
  buildCreateControlLoadedSource,
  shortenCreateControlUrl,
  type CreateControlDataSourceKind,
  type CreateControlLoadedSource,
} from './loaded-source';
import {
  applyCreateControlLayerName,
  getCreateControlSampleUrl,
  getCreateControlSamples,
  layerNameFromFileGdbFiles,
  layerNameFromFileName,
  layerNameFromUrl,
  type CreateControlLayerKind,
  type CreateControlSample,
} from './presets';

/** Whether pasted text looks like a finished GIS document (avoid errors mid-type). */
export function looksCompleteGis(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return true;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return true;
  if (trimmed.startsWith('<') && /<\/[a-z]+>\s*$/i.test(trimmed)) return true;
  return /^(GEOMETRYCOLLECTION|MULTI(POINT|LINESTRING|POLYGON)|POINT|LINESTRING|POLYGON)\s*\([\s\S]*\)$/i.test(
    trimmed,
  );
}

/** Locale key for the loaded-source eyebrow by data kind. */
export function createControlLoadedSourceEyebrowKey(
  kind?: CreateControlDataSourceKind,
): string {
  if (kind === 'file') return 'map.layer-control.create.loaded-from-file';
  if (kind === 'url') return 'map.layer-control.create.loaded-from-url';
  return 'map.layer-control.create.loaded-from-paste';
}

/**
 * Build meta chips for the CreateControl loaded-data card.
 * Pass already-translated feature/geometry labels.
 */
export function buildCreateControlLoadedMetaChips(
  source: CreateControlLoadedSource | null | undefined,
  labels: { featuresCount: string; geometryTypes: string },
): string[] {
  if (!source) return [];
  const chips: string[] = [];
  if (typeof source.featureCount === 'number') {
    chips.push(`${labels.featuresCount}: ${source.featureCount}`);
  }
  if (source.geometryTypes?.length) {
    chips.push(`${labels.geometryTypes}: ${source.geometryTypes.join(', ')}`);
  }
  if (typeof source.bytes === 'number') {
    chips.push(formatCreateControlBytes(source.bytes));
  }
  return chips;
}

export type CreateControlUploadFileSummary = {
  label: string;
  totalBytes: number;
  fileName: string;
};

/** Label + size summary for one or more dropped GIS files. */
export function summarizeCreateControlUploadFiles(
  files: Array<{ name?: string; size?: number }>,
): CreateControlUploadFileSummary {
  const totalBytes = files.reduce((sum, file) => sum + (file?.size ?? 0), 0);
  const label =
    files.length === 1
      ? files[0]?.name || 'file'
      : `${files.length} files`;
  const fileName = files[0]?.name || label;
  return { label, totalBytes, fileName };
}

/** Status line while parsing (optional worker progress ratio 0–1). */
export function formatCreateControlParseStatus(
  parsingLabel: string,
  totalBytes: number,
  progressRatio?: number | null,
): string {
  const size = formatCreateControlBytes(totalBytes);
  if (progressRatio == null) {
    return `${parsingLabel} (${size})`;
  }
  const pct = Math.round(progressRatio * 100);
  return `${parsingLabel} ${pct}% (${size})`;
}

/**
 * Subscribe to geojson worker progress and push formatted status strings.
 * Returns an unsubscribe function.
 */
export function subscribeCreateControlParseProgress(
  parsingLabel: string,
  totalBytes: number,
  onStatus: (text: string) => void,
): () => void {
  return WorkerMonitor.subscribe(() => {
    const snap = WorkerMonitor.get('geojson');
    const task = snap?.pending?.[0];
    const ratio = workerProgressRatio(task?.progress);
    if (ratio == null) return;
    onStatus(formatCreateControlParseStatus(parsingLabel, totalBytes, ratio));
  });
}

export function findCreateControlSampleById(
  layerKind: CreateControlLayerKind,
  sampleId: string,
): CreateControlSample | undefined {
  if (!sampleId) return undefined;
  return getCreateControlSamples(layerKind).find((item) => item.id === sampleId);
}

/** URL to fill when a sample is selected; `null` if id is empty/unknown. */
export function resolveCreateControlSampleSelection(
  layerKind: CreateControlLayerKind,
  sampleId: string,
): string | null {
  const sample = findCreateControlSampleById(layerKind, sampleId);
  if (!sample) return null;
  return getCreateControlSampleUrl(sample);
}

/**
 * After the URL field changes, clear the sample id when it no longer matches.
 * Returns the next sample id (possibly `''`).
 */
export function resolveCreateControlSampleIdAfterUrlEdit(
  layerKind: CreateControlLayerKind,
  sampleId: string,
  url: string,
): string {
  const sample = findCreateControlSampleById(layerKind, sampleId);
  if (!sample) return sampleId;
  if (getCreateControlSampleUrl(sample) !== url.trim()) return '';
  return sampleId;
}

/** Sample whose configured URL matches both id and the current URL field. */
export function findCreateControlSampleMatchingUrl(
  layerKind: CreateControlLayerKind,
  sampleId: string,
  url: string,
): CreateControlSample | undefined {
  const sample = findCreateControlSampleById(layerKind, sampleId);
  if (!sample) return undefined;
  if (getCreateControlSampleUrl(sample) !== url.trim()) return undefined;
  return sample;
}

export type CreateControlFileParseResult = {
  geojson: GeoJSON;
  crs: string | null;
  format?: GisFormat;
  layers?: Array<{ name: string; geojson: import('geojson').FeatureCollection }>;
  loadedSource: CreateControlLoadedSource;
  suggestedName: string;
};

/** Parse dropped GIS file(s) and build loaded-source + suggested layer name. */
export async function parseCreateControlUploadedFiles(
  files: Array<
    Blob & { name?: string; size?: number; webkitRelativePath?: string }
  >,
): Promise<CreateControlFileParseResult> {
  const { label, totalBytes, fileName } = summarizeCreateControlUploadFiles(files);
  const { geojson, crs, format, layers } = await loadGisFileAsync(files);
  if (!geojson) {
    throw new Error('Unsupported or invalid GIS data');
  }
  const suggestedName =
    format === 'filegdb'
      ? layerNameFromFileGdbFiles(files) || layerNameFromFileName(fileName)
      : layerNameFromFileName(fileName);

  const layerFeatureCount = layers?.reduce(
    (sum, layer) => sum + (layer.geojson.features?.length ?? 0),
    0,
  );
  const layerGeometryTypes = layers
    ? [
        ...new Set(
          layers.flatMap((layer) =>
            (layer.geojson.features ?? [])
              .map((feature) => feature.geometry?.type)
              .filter((type): type is NonNullable<typeof type> => !!type),
          ),
        ),
      ].sort()
    : undefined;

  return {
    geojson,
    crs,
    format,
    layers,
    loadedSource: buildCreateControlLoadedSource({
      kind: 'file',
      label:
        format === 'filegdb' && suggestedName
          ? `${suggestedName}.gdb`
          : label,
      detail:
        files.length > 1
          ? files.map((f) => f.name).filter(Boolean).join(', ')
          : layers?.length
            ? layers.map((layer) => layer.name).join(', ')
            : undefined,
      bytes: totalBytes,
      format,
      // FileGDB `geojson` is a 1-feature placeholder; prefer layer totals.
      geojson: layers?.length ? undefined : geojson,
      featureCount: layerFeatureCount,
      geometryTypes: layerGeometryTypes,
    }),
    suggestedName,
  };
}

export type CreateControlPasteParseResult = {
  geojson: GeoJSON;
  crs: string | null;
  format?: GisFormat;
  loadedSource: CreateControlLoadedSource;
};

/**
 * Parse pasted GIS text. Returns `null` when parse yields no geojson
 * (caller may still show an error if {@link looksCompleteGis}).
 */
export async function parseCreateControlPastedText(
  text: string,
  pasteLabel: string,
): Promise<CreateControlPasteParseResult | null> {
  const { geojson, crs, format } = await loadGisTextAsync(text);
  if (!geojson) return null;
  return {
    geojson,
    crs,
    format,
    loadedSource: buildCreateControlLoadedSource({
      kind: 'paste',
      label: pasteLabel,
      format,
      geojson,
    }),
  };
}

export type CreateControlVectorUrlLoadResult = {
  patch: Record<string, unknown>;
  loadedSource: CreateControlLoadedSource;
};

/** Load geojson CreateControl data from a sample or arbitrary GIS URL. */
export async function loadCreateControlVectorFromUrl(options: {
  url: string;
  sampleId: string;
  currentName: string;
}): Promise<CreateControlVectorUrlLoadResult> {
  const url = options.url.trim();
  const sample = findCreateControlSampleMatchingUrl(
    'geojson',
    options.sampleId,
    url,
  );

  if (sample) {
    const samplePatch = await applyCreateControlSample(sample);
    const geojson =
      (samplePatch['geojson'] as GeoJSON | null | undefined) ?? null;
    const patch: Record<string, unknown> = {
      ...samplePatch,
      name: applyCreateControlLayerName(
        options.currentName,
        sample.label,
        'geojson',
      ),
    };
    return {
      patch,
      loadedSource: buildCreateControlLoadedSource({
        kind: 'url',
        label: sample.label,
        detail: shortenCreateControlUrl(url),
        geojson,
      }),
    };
  }

  const result = await loadGisUrlAsync(url);
  const patch: Record<string, unknown> = {
    geojson: result.geojson,
    name: applyCreateControlLayerName(
      options.currentName,
      layerNameFromUrl(url),
      'geojson',
    ),
  };
  if (result.crs) {
    patch['crs'] = result.crs;
    patch['detectedCrs'] = result.crs;
  }
  return {
    patch,
    loadedSource: buildCreateControlLoadedSource({
      kind: 'url',
      label: shortenCreateControlUrl(url),
      detail: url,
      format: result.format,
      geojson: result.geojson,
    }),
  };
}

function looksPmtilesUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.endsWith('.pmtiles') ||
    lower.includes('.pmtiles?') ||
    lower.startsWith('pmtiles://')
  );
}

function archiveFormPatch(
  opened: {
    tiles: string[];
    archiveId: string;
    kind: 'mbtiles' | 'pmtiles';
    tileKind: 'vector' | 'raster';
    bounds?: [number, number, number, number];
    minzoom?: number;
    maxzoom?: number;
    sourceLayer?: string;
    sourceLayers: string[];
    sourceLayerInfos?: VectorTileSourceLayerInfo[];
    name?: string;
    format?: string;
  },
  currentName: string,
  fallbackName: string,
  layerKind: 'mbtiles' | 'pmtiles',
): Record<string, unknown> {
  const infos: VectorTileSourceLayerInfo[] = opened.sourceLayerInfos?.length
    ? opened.sourceLayerInfos
    : opened.sourceLayers.map((id) => ({ id }));
  return {
    url: opened.tiles[0],
    tiles: opened.tiles,
    archiveId: opened.archiveId,
    archiveKind: opened.kind,
    tileKind: opened.tileKind,
    format: opened.format ?? '',
    bounds: opened.bounds,
    minzoom: opened.minzoom,
    maxzoom: opened.maxzoom,
    sourceLayer: opened.sourceLayer ?? '',
    sourceLayers: opened.sourceLayers,
    sourceLayerOptions: infos.map((info) => ({
      id: info.id,
      enabled: true,
      fields: info.fields,
      geometryTypes: info.geometryTypes,
      description: info.description,
    })),
    styleType: 'auto',
    name: applyCreateControlLayerName(
      currentName,
      opened.name || fallbackName,
      layerKind,
    ),
  };
}

/** Load XYZ / sample / PMTiles URL for CreateControl \xyz\ or \pmtiles\. */
export async function loadCreateControlVectorTileFromUrl(options: {
  url: string;
  sampleId: string;
  currentName: string;
  layerKind?: 'xyz' | 'pmtiles';
}): Promise<CreateControlVectorUrlLoadResult> {
  const layerKind = options.layerKind ?? 'xyz';
  const url = options.url.trim();
  const sample = findCreateControlSampleMatchingUrl('xyz', options.sampleId, url);

  if (sample && layerKind === 'xyz') {
    const samplePatch = await applyCreateControlSample(sample);
    return {
      patch: {
        ...samplePatch,
        name: applyCreateControlLayerName(
          options.currentName,
          sample.label,
          'xyz',
        ),
      },
      loadedSource: buildCreateControlLoadedSource({
        kind: 'url',
        label: sample.label,
        detail: shortenCreateControlUrl(url),
      }),
    };
  }

  if (looksPmtilesUrl(url) || layerKind === 'pmtiles') {
    const { openPmtilesUrl } = await import('../vector-tile/vectortile-worker.client');
    const opened = await openPmtilesUrl(url);
    return {
      patch: archiveFormPatch(
        { ...opened, kind: 'pmtiles' },
        options.currentName,
        layerNameFromUrl(url),
        'pmtiles',
      ),
      loadedSource: buildCreateControlLoadedSource({
        kind: 'url',
        label: opened.name || shortenCreateControlUrl(url),
        detail: url,
        format: 'pmtiles',
      }),
    };
  }

  const isVector = /\.pbf/i.test(url) || /\bmvt\b/i.test(url);
  return {
    patch: {
      url,
      tiles: [url],
      tileKind: isVector ? 'vector' : 'raster',
      styleType: 'auto',
      name: applyCreateControlLayerName(
        options.currentName,
        layerNameFromUrl(url),
        'xyz',
      ),
    },
    loadedSource: buildCreateControlLoadedSource({
      kind: 'url',
      label: shortenCreateControlUrl(url),
      detail: url,
      format: 'xyz',
    }),
  };
}

/** Open a local .pmtiles / .mbtiles file for CreateControl archives. */
export async function loadCreateControlVectorTileFromFile(
  file: File,
  currentName: string,
  layerKind?: 'mbtiles' | 'pmtiles',
): Promise<CreateControlVectorUrlLoadResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.mbtiles')) {
    if (layerKind && layerKind !== 'mbtiles') {
      throw new Error('Expected a .mbtiles file');
    }
    const { openMbtilesArchive } = await import(
      '../vector-tile/vectortile-worker.client'
    );
    const opened = await openMbtilesArchive(file);
    return {
      patch: archiveFormPatch(
        { ...opened, kind: 'mbtiles' },
        currentName,
        layerNameFromFileName(file.name),
        'mbtiles',
      ),
      loadedSource: buildCreateControlLoadedSource({
        kind: 'file',
        label: file.name,
        bytes: file.size,
        format: 'mbtiles',
      }),
    };
  }

  if (name.endsWith('.pmtiles')) {
    if (layerKind && layerKind !== 'pmtiles') {
      throw new Error('Expected a .pmtiles file');
    }
    const { openPmtilesFile } = await import(
      '../vector-tile/vectortile-worker.client'
    );
    const opened = await openPmtilesFile(file);
    return {
      patch: archiveFormPatch(
        { ...opened, kind: 'pmtiles' },
        currentName,
        layerNameFromFileName(file.name),
        'pmtiles',
      ),
      loadedSource: buildCreateControlLoadedSource({
        kind: 'file',
        label: file.name,
        bytes: file.size,
        format: 'pmtiles',
      }),
    };
  }

  throw new Error('Unsupported archive file (use .pmtiles or .mbtiles)');
}

function resolveTileJsonTileUrls(
  tiles: string[],
  tileJsonUrl: string,
): string[] {
  return tiles
    .map((t) => t?.trim())
    .filter((t): t is string => !!t)
    .map((t) => {
      try {
        // `new URL` percent-encodes `{z}/{x}/{y}`; MapLibre needs the braces.
        return decodeURI(new URL(t, tileJsonUrl).href);
      } catch {
        return t;
      }
    });
}

/** Parse a TileJSON object into a CreateControl form patch. */
export function tileJsonToCreateControlPatch(
  tileJson: unknown,
  tileJsonUrl: string,
  currentName: string,
): Record<string, unknown> {
  if (!tileJson || typeof tileJson !== 'object') {
    throw new Error('Invalid TileJSON document');
  }
  const root = tileJson as {
    name?: string;
    tiles?: string[];
    bounds?: number[];
    minzoom?: number;
    maxzoom?: number;
    format?: string;
  };
  const rawTiles = Array.isArray(root.tiles) ? root.tiles : [];
  const tiles = resolveTileJsonTileUrls(rawTiles, tileJsonUrl);
  if (!tiles.length) {
    throw new Error('TileJSON has no tiles[] templates');
  }

  const infos = parseVectorLayerInfosFromObject(tileJson);
  const sourceLayers = infos.map((l) => l.id);
  const format = (root.format ?? '').trim();
  const tileKind =
    sourceLayers.length || /^(pbf|mvt)$/i.test(format) ? 'vector' : 'raster';
  const bounds =
    Array.isArray(root.bounds) && root.bounds.length >= 4
      ? ([
          Number(root.bounds[0]),
          Number(root.bounds[1]),
          Number(root.bounds[2]),
          Number(root.bounds[3]),
        ] as [number, number, number, number])
      : undefined;

  return {
    url: tileJsonUrl,
    tiles,
    tileKind,
    format: format || (tileKind === 'vector' ? 'pbf' : ''),
    bounds: bounds ?? [-180, -85.051129, 180, 85.051129],
    minzoom: root.minzoom != null ? Number(root.minzoom) : 0,
    maxzoom: root.maxzoom != null ? Number(root.maxzoom) : 22,
    sourceLayer: sourceLayers[0] ?? '',
    sourceLayers: tileKind === 'vector' ? sourceLayers : [],
    sourceLayerOptions:
      tileKind === 'vector'
        ? infos.map((info) => ({
            id: info.id,
            enabled: true,
            fields: info.fields,
            geometryTypes: info.geometryTypes,
            description: info.description,
          }))
        : [],
    styleType: 'auto',
    name: applyCreateControlLayerName(
      currentName,
      root.name || layerNameFromUrl(tileJsonUrl),
      'tilejson',
    ),
  };
}

/** Fetch TileJSON and build CreateControl patch + loaded-source card. */
export async function loadCreateControlTileJsonFromUrl(options: {
  url: string;
  sampleId: string;
  currentName: string;
}): Promise<CreateControlVectorUrlLoadResult> {
  const url = options.url.trim();
  if (!url) throw new Error('Enter a TileJSON URL');

  const sample = findCreateControlSampleMatchingUrl(
    'tilejson',
    options.sampleId,
    url,
  );
  const fetchUrl = sample?.dataUrl?.trim() || url;

  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error(`Failed to load TileJSON (${response.status})`);
  }
  const tileJson = await response.json();
  const patch = tileJsonToCreateControlPatch(
    tileJson,
    fetchUrl,
    options.currentName,
  );

  return {
    patch,
    loadedSource: buildCreateControlLoadedSource({
      kind: 'url',
      label:
        typeof patch['name'] === 'string'
          ? patch['name']
          : shortenCreateControlUrl(fetchUrl),
      detail: shortenCreateControlUrl(fetchUrl),
      format: 'tilejson',
    }),
  };
}

/** Infer field types + geometry types from a FileGDB feature-class GeoJSON. */
export function summarizeFileGdbLayerMeta(
  geojson: import('geojson').FeatureCollection | null | undefined,
): {
  fields: Record<string, string>;
  geometryTypes: string[];
  featureCount: number;
} {
  const features = geojson?.features ?? [];
  const geometryTypes = new Set<string>();
  const fields: Record<string, string> = {};

  for (const feature of features) {
    const geomType = feature?.geometry?.type;
    if (typeof geomType === 'string') geometryTypes.add(geomType);

    const props = feature?.properties;
    if (!props || typeof props !== 'object') continue;
    for (const [key, value] of Object.entries(props)) {
      if (key === '__gdb_layer') continue;
      if (fields[key]) continue;
      if (value == null) {
        fields[key] = '';
        continue;
      }
      const t = typeof value;
      if (t === 'number') fields[key] = 'Number';
      else if (t === 'boolean') fields[key] = 'Boolean';
      else if (t === 'string') fields[key] = 'String';
      else fields[key] = 'Object';
    }
  }

  return {
    fields,
    geometryTypes: [...geometryTypes].sort(),
    featureCount: features.length,
  };
}

/** Form patch keys for syncing geojson preview + detected CRS (+ FileGDB layers). */
export function createControlGeojsonPreviewPatch(
  geojson: GeoJSON | null,
  crs?: string | null,
  layers?: Array<{ name: string; geojson: import('geojson').FeatureCollection }> | null,
): Record<string, unknown> {
  const patch: Record<string, unknown> = { geojson };
  if (crs) {
    patch['crs'] = crs;
    patch['detectedCrs'] = crs;
  }
  if (!geojson) {
    patch['detectedCrs'] = undefined;
    patch['gdbLayers'] = [];
    patch['sourceLayers'] = [];
    patch['sourceLayerOptions'] = [];
  } else if (layers?.length) {
    patch['gdbLayers'] = layers;
    patch['sourceLayers'] = layers.map((layer) => layer.name);
    // Huge feature classes (e.g. UNOSAT flood polys) OOM the browser if all
    // enabled by default — opt in large layers; keep smaller ones on.
    const FILEGDB_AUTO_ENABLE_MAX_FEATURES = 5_000;
    const options = layers.map((layer) => {
      const meta = summarizeFileGdbLayerMeta(layer.geojson);
      return {
        id: layer.name,
        enabled:
          meta.featureCount > 0 &&
          meta.featureCount <= FILEGDB_AUTO_ENABLE_MAX_FEATURES,
        fields: meta.fields,
        geometryTypes: meta.geometryTypes,
        featureCount: meta.featureCount,
      };
    });
    if (!options.some((option) => option.enabled) && options[0]) {
      options[0].enabled = true;
    }
    patch['sourceLayerOptions'] = options;
  }
  return patch;
}
