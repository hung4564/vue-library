/**
 * FileGDB → GeoJSON via optional peer `gdal3.js` (OpenFileGDB).
 * Main thread only — keep this module out of the GIS worker graph.
 *
 * Types are local: the published `gdal3.js` `.d.ts` omits runtime `Module.FS`
 * and requires `paths.wasm`/`data`, which breaks our CDN / optional-path usage.
 */
import { loggerFactory } from '@hungpvq/shared-log';
import type { Feature, FeatureCollection, GeoJSON } from 'geojson';

import { asFeatureCollection } from '../utils/feature-collection';
import { featuresWithGeometry } from './filegdb-meta';
import { isIgnoredZipEntry } from './gis-format';
import type { GisLoadResult, GisProgress } from './gis-parse';

const log = loggerFactory.createLogger().setNamespace('map-dataset:filegdb', 2);

export type FileGdbGdalConfig = {
  /** Directory or CDN base that contains `gdal3WebAssembly.wasm` / `.data`. */
  path?: string;
  /**
   * Optional overrides. `js` may be an absolute URL for the classic-script loader;
   * `wasm` / `data` should be basenames relative to `path` when set.
   */
  paths?: { wasm?: string; data?: string; js?: string };
  useWorker?: boolean;
};

type GdalDataset = {
  pointer: number;
  path: string;
  type: string;
  info?: unknown;
};

type GdalFs = {
  mkdir: (path: string) => void;
  writeFile: (path: string, data: Uint8Array) => void;
  unlink?: (path: string) => void;
};

type GdalApi = {
  Module: { FS: GdalFs };
  open: (
    file: string | File | FileList | string[],
    options?: string[],
    vfs?: string[],
  ) => Promise<{ datasets: GdalDataset[]; errors: unknown[] }>;
  close: (dataset: GdalDataset) => Promise<void>;
  getInfo: (dataset: GdalDataset) => Promise<{
    layerCount?: number;
    layers?: Array<{ name: string; featureCount: number }>;
    driverName?: string;
  }>;
  ogr2ogr: (
    dataset: GdalDataset,
    options?: string[],
    outputName?: string,
  ) => Promise<{ local: string; real: string } | string>;
  getFileBytes: (
    filePath: string | { local: string; real: string },
  ) => Promise<Uint8Array>;
  drivers: {
    raster: Record<string, unknown>;
    vector: Record<string, unknown>;
  };
};

type InitGdalJs = (config?: FileGdbGdalConfig) => Promise<GdalApi>;

let gdalConfig: FileGdbGdalConfig | undefined;
let gdalPromise: Promise<GdalApi> | null = null;

/** Configure WASM asset URLs before the first FileGDB parse. */
export function configureFileGdbGdal(config: FileGdbGdalConfig): void {
  gdalConfig = config;
  gdalPromise = null;
}

function missingPeer(name: string, useCase: string): Error {
  return new Error(
    `Optional peer "${name}" is required for ${useCase}. Install it in your app (e.g. npm i ${name}).`,
  );
}

async function loadJsZip() {
  try {
    return (await import('jszip')).default;
  } catch {
    throw missingPeer('jszip', 'ZIP FileGDB import');
  }
}

const GDAL_CDN = 'https://cdn.jsdelivr.net/npm/gdal3.js@2.8.1/dist/package';

function getGlobalInitGdal(): InitGdalJs | null {
  if (typeof globalThis === 'undefined') return null;
  const init = (globalThis as Record<string, unknown>)['initGdalJs'];
  return typeof init === 'function' ? (init as InitGdalJs) : null;
}

function loadGdalScript(src: string): Promise<void> {
  if (typeof document === 'undefined' || !document.head) {
    return Promise.reject(
      new Error(
        'FileGDB/gdal3.js requires a browser document (main thread only)',
      ),
    );
  }
  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-hungpvq-gdal3="1"]',
  );
  if (existing) {
    if (getGlobalInitGdal()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error(`Failed to load gdal3.js from ${existing.src}`)),
        { once: true },
      );
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset['hungpvqGdal3'] = '1';
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Failed to load gdal3.js from ${src}`));
    document.head.appendChild(script);
  });
}

async function loadGdal(): Promise<GdalApi> {
  if (!gdalPromise) {
    gdalPromise = (async () => {
      try {
        // Never npm-import gdal3.js under Vite — Emscripten CModule().then breaks.
        const base = (gdalConfig?.path ?? GDAL_CDN).replace(/\/$/, '');
        let init = getGlobalInitGdal();
        if (!init) {
          await loadGdalScript(gdalConfig?.paths?.js ?? `${base}/gdal3.js`);
          init = getGlobalInitGdal();
        }
        if (!init) {
          throw new Error(
            'gdal3.js did not export initGdalJs (CDN UMD or configureFileGdbGdal paths.js)',
          );
        }

        const wasmName = gdalConfig?.paths?.wasm;
        const dataName = gdalConfig?.paths?.data;
        const relativePaths: { wasm?: string; data?: string } = {};
        if (wasmName && !/^https?:\/\//i.test(wasmName)) {
          relativePaths.wasm = wasmName;
        }
        if (dataName && !/^https?:\/\//i.test(dataName)) {
          relativePaths.data = dataName;
        }
        return await init({
          ...gdalConfig,
          path: `${base}/`,
          paths:
            Object.keys(relativePaths).length > 0 ? relativePaths : undefined,
          useWorker: false,
        });
      } catch (error) {
        gdalPromise = null;
        if (
          error instanceof Error &&
          /Cannot find module|Failed to fetch dynamically imported module|Cannot find package/i.test(
            error.message,
          )
        ) {
          throw missingPeer('gdal3.js', 'File Geodatabase GIS import');
        }
        throw error instanceof Error
          ? error
          : new Error(String(error ?? 'Failed to init gdal3.js'));
      }
    })();
  }
  return gdalPromise;
}

function ensureFsDir(FS: GdalFs, filePath: string): void {
  const parts = filePath.replace(/\\/g, '/').split('/').filter(Boolean);
  parts.pop();
  let cur = '';
  for (const part of parts) {
    cur += `/${part}`;
    try {
      FS.mkdir(cur);
    } catch {
      // directory may already exist
    }
  }
}

/** First `Something.gdb` folder name found in zip/member paths. */
function findFileGdbRootName(paths: string[]): string | null {
  for (const raw of paths) {
    const normalized = raw.replace(/\\/g, '/');
    const match = normalized.match(/(?:^|\/)([^/]+\.gdb)(?:\/|$)/i);
    if (match?.[1]) return match[1];
  }
  return null;
}

function stampLayer(
  collection: FeatureCollection,
  layerName: string,
): Feature[] {
  return collection.features.map((feature) => ({
    ...feature,
    properties: {
      ...(feature.properties || {}),
      __gdb_layer: layerName,
    },
  }));
}

function quoteOgrLayerName(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function yieldForUi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof setTimeout === 'function') setTimeout(resolve, 0);
    else resolve();
  });
}

async function datasetToFeatureLayers(
  Gdal: GdalApi,
  dataset: GdalDataset,
  report?: GisProgress,
): Promise<Array<{ name: string; geojson: FeatureCollection }>> {
  const info = await Gdal.getInfo(dataset);
  const layers = (info.layers ?? []).filter((layer) => layer.featureCount > 0);
  if (!layers.length) {
    throw new Error('FileGDB did not contain readable feature classes');
  }

  const outLayers: Array<{ name: string; geojson: FeatureCollection }> = [];
  const failures: string[] = [];
  const skippedNoGeom: string[] = [];

  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];
    report?.(i, layers.length, layer.name);
    await yieldForUi();
    try {
      const safeName = layer.name.replace(/[^\w.-]+/g, '_');
      const out = await Gdal.ogr2ogr(
        dataset,
        [
          '-f',
          'GeoJSON',
          '-t_srs',
          'EPSG:4326',
          '-mapFieldType',
          'Binary=String',
          '--config',
          'OGR_ORGANIZE_POLYGONS',
          'SKIP',
          '-skipfailures',
          '-sql',
          `SELECT * FROM ${quoteOgrLayerName(layer.name)}`,
        ],
        `filegdb_${i}_${safeName}`,
      );
      const bytes = await Gdal.getFileBytes(out);
      if (!bytes?.length) {
        failures.push(`${layer.name}: empty ogr2ogr output`);
        continue;
      }
      const text = new TextDecoder().decode(bytes);
      const parsed = JSON.parse(text) as GeoJSON;
      const collection = asFeatureCollection(parsed);
      const geomFeatures = featuresWithGeometry(collection?.features ?? []);
      if (!geomFeatures.length) {
        skippedNoGeom.push(layer.name);
        log
          .with({ fn: 'datasetToFeatureLayers', span: 'filegdb.parse' })
          .debug('Skipped FileGDB layer with no drawable geometries.', {
            layer: layer.name,
            featureCount: collection?.features?.length ?? 0,
          });
        continue;
      }
      outLayers.push({
        name: layer.name,
        geojson: {
          type: 'FeatureCollection',
          features: stampLayer(
            { type: 'FeatureCollection', features: geomFeatures },
            layer.name,
          ),
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? 'unknown');
      failures.push(`${layer.name}: ${message}`);
      log
        .with({ fn: 'datasetToFeatureLayers', span: 'filegdb.parse' })
        .warn('FileGDB layer conversion failed.', {
          layer: layer.name,
          errorMessage: message,
        });
    }
  }

  if (!outLayers.length) {
    const emptySpatial = (info.layers ?? [])
      .filter(
        (layer) =>
          layer.featureCount === 0 && !skippedNoGeom.includes(layer.name),
      )
      .map((layer) => layer.name);
    const parts: string[] = [];
    if (skippedNoGeom.length) {
      parts.push(
        `only non-spatial attribute tables had rows (${skippedNoGeom.join(', ')})`,
      );
    }
    if (emptySpatial.length) {
      const sample = emptySpatial.slice(0, 8).join(', ');
      const more =
        emptySpatial.length > 8 ? ` (+${emptySpatial.length - 8} more)` : '';
      parts.push(`spatial layers are empty (${sample}${more})`);
    }
    if (failures.length) {
      parts.push(`conversion failures: ${failures.join('; ')}`);
    }
    throw new Error(
      parts.length
        ? `FileGDB has no drawable geometries — ${parts.join('; ')}`
        : 'FileGDB has no drawable geometries',
    );
  }

  if (failures.length || skippedNoGeom.length) {
    log
      .with({ fn: 'datasetToFeatureLayers', span: 'filegdb.parse' })
      .info('FileGDB parse finished with partial layer coverage.', {
        ok: outLayers.map((layer) => layer.name),
        failures,
        skippedNoGeom,
      });
  }

  report?.(layers.length, layers.length, 'filegdb');
  return outLayers;
}

/**
 * Root `geojson` is a lightweight placeholder (real data lives in `layers`).
 */
function wrapFileGdb(
  layers: Array<{ name: string; geojson: FeatureCollection }>,
): GisLoadResult {
  const sample = layers[0]?.geojson.features[0];
  return {
    geojson: {
      type: 'FeatureCollection',
      features: sample ? [sample] : [],
    },
    crs: '4326',
    format: 'filegdb',
    layers,
  };
}

async function ensureGdalOpenFileGdb(): Promise<GdalApi> {
  const Gdal = await loadGdal();
  if (!Gdal.drivers?.vector?.['OpenFileGDB']) {
    throw new Error('gdal3.js build is missing the OpenFileGDB driver');
  }
  return Gdal;
}

function mkdirMountRoot(FS: GdalFs): string {
  const mountRoot = `/input/_filegdb_${Date.now()}`;
  try {
    FS.mkdir(mountRoot);
  } catch {
    /* exists */
  }
  return mountRoot;
}

async function convertOpenedFileGdb(
  Gdal: GdalApi,
  dataset: GdalDataset,
  report?: GisProgress,
): Promise<GisLoadResult> {
  try {
    return wrapFileGdb(await datasetToFeatureLayers(Gdal, dataset, report));
  } finally {
    try {
      await Gdal.close(dataset);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Parse a zipped FileGDB (`.gdb.zip`, `*_gdb.zip`, or any zip with `*.gdb/`).
 */
export async function parseFileGdbZipBuffer(
  buffer: ArrayBuffer,
  report?: GisProgress,
): Promise<GisLoadResult> {
  report?.(0, 3, 'filegdb');
  const Gdal = await ensureGdalOpenFileGdb();

  const JSZip = await loadJsZip();
  const zip = await JSZip.loadAsync(buffer);
  const entries = Object.values(zip.files).filter(
    (entry) => !entry.dir && !isIgnoredZipEntry(entry.name),
  );
  const gdbRoot = findFileGdbRootName(entries.map((entry) => entry.name));
  if (!gdbRoot) {
    throw new Error('ZIP does not contain a FileGDB folder (*.gdb)');
  }

  report?.(1, 3, 'mount');
  const FS = Gdal.Module.FS;
  const mountRoot = mkdirMountRoot(FS);
  const gdbPrefix = gdbRoot.toLowerCase();
  for (const entry of entries) {
    const normalized = entry.name.replace(/\\/g, '/');
    const idx = normalized.toLowerCase().indexOf(gdbPrefix);
    if (idx < 0) continue;
    const dest = `${mountRoot}/${normalized.slice(idx)}`;
    ensureFsDir(FS, dest);
    FS.writeFile(dest, await entry.async('uint8array'));
  }

  report?.(2, 3, 'open');
  const opened = await Gdal.open(`${mountRoot}/${gdbRoot}`);
  if (!opened.datasets?.length) {
    const detail = opened.errors?.length
      ? String(opened.errors[0])
      : 'OpenFileGDB returned no datasets';
    throw new Error(`Failed to open FileGDB: ${detail}`);
  }
  return convertOpenedFileGdb(Gdal, opened.datasets[0], report);
}

/**
 * Parse a FileGDB folder upload (`File` members under `Something.gdb/`).
 */
export async function parseFileGdbFolderFiles(
  files: Array<
    Blob & {
      name?: string;
      webkitRelativePath?: string;
      arrayBuffer: () => Promise<ArrayBuffer>;
    }
  >,
  report?: GisProgress,
): Promise<GisLoadResult> {
  report?.(0, 3, 'filegdb');
  const Gdal = await ensureGdalOpenFileGdb();

  const paths = files.map((file) => file.webkitRelativePath || file.name || '');
  const gdbRoot = findFileGdbRootName(paths);
  if (!gdbRoot) {
    throw new Error(
      'Drop a .gdb folder (or zip). Could not find a *.gdb directory in the upload.',
    );
  }

  report?.(1, 3, 'mount');
  const FS = Gdal.Module.FS;
  const mountRoot = mkdirMountRoot(FS);
  const gdbPrefix = gdbRoot.toLowerCase();
  for (const file of files) {
    const normalized = (file.webkitRelativePath || file.name || '').replace(
      /\\/g,
      '/',
    );
    const idx = normalized.toLowerCase().indexOf(gdbPrefix);
    if (idx < 0) continue;
    const dest = `${mountRoot}/${normalized.slice(idx)}`;
    ensureFsDir(FS, dest);
    FS.writeFile(dest, new Uint8Array(await file.arrayBuffer()));
  }

  report?.(2, 3, 'open');
  const opened = await Gdal.open(`${mountRoot}/${gdbRoot}`);
  if (!opened.datasets?.length) {
    throw new Error('Failed to open FileGDB folder with OpenFileGDB');
  }
  return convertOpenedFileGdb(Gdal, opened.datasets[0], report);
}
