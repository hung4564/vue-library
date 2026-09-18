import type { GeoJSON } from 'geojson';
import {
  bboxFromGeojson,
  connectWorkerMonitor,
  isCallStackOverflow,
  MapError,
  reprojectGeojson,
  toPlainJson,
  type GeojsonBbox,
} from '@hungpvq/map-core';
import { normalizeEpsgCode } from '@hungpvq/map-core/crs';
import { getOrCreateStore } from '@hungpvq/shared-store';
import {
  detectGeojsonStyleTypes,
  shouldUseGisWorkerForGeojson,
} from './geojson-parse';
import type { LayerStyleType } from '../style/layer-simple-builder';
import { parseGisFiles, parseGisFromUrl, parseGisTextAsync } from '../create-control/gis-parse';
import type { GisLoadResult } from '../create-control/gis-parse';
import type {
  GeojsonWorkerRequest,
  GeojsonWorkerResponse,
} from './geojson.worker';

const GEOJSON_WORKER_ID = 'geojson';

type GisWorkerSlot = {
  urlOverride: string | URL | undefined;
};

function gisWorkerSlot(): GisWorkerSlot {
  return getOrCreateStore('__hungpvq_gis_worker__', () => ({
    urlOverride: undefined as string | URL | undefined,
  }));
}


export type ConfigureGisWorkerOptions = {
  /**
   * Absolute or base-relative URL to the published worker script
   * (`@hungpvq/map-dataset/geojson-worker` → `assets/geojson.worker.js`).
   * Required when the bundler relocates package chunks so
   * `new URL(..., import.meta.url)` no longer points at the package file
   * (Webpack copy, CDN, static hosting without Vite).
   */
  url: string | URL;
};

/**
 * Override the GIS Web Worker script URL. Call once at app startup (before
 * CreateControl / `loadGis*Async`). Resets any existing worker instance.
 */
export function configureGisWorker(options: ConfigureGisWorkerOptions): void {
  gisWorkerSlot().urlOverride = options.url;
  terminateGeojsonWorker();
}

function resolveOverrideGisWorkerUrl(): URL {
  const gisWorkerUrlOverride = gisWorkerSlot().urlOverride;
  if (gisWorkerUrlOverride == null) {
    throw new Error('GIS worker URL override is not configured');
  }
  if (gisWorkerUrlOverride instanceof URL) return gisWorkerUrlOverride;
  const base =
    typeof document !== 'undefined' && document.baseURI
      ? document.baseURI
      : import.meta.url;
  return new URL(gisWorkerUrlOverride, base);
}

/**
 * Resolve the Worker script URL: explicit {@link configureGisWorker} override, else
 * the published default (`assets/geojson.worker.js` next to this module).
 *
 * `@vite-ignore` avoids a second asset graph edge (which would inline raw `.ts` as a
 * `data:` URL). {@link createWorker} keeps the static `new Worker(new URL('./geojson.worker.ts', …))`
 * pattern so the lib build still emits the real worker file.
 */
export function resolveGisWorkerUrl(): URL {
  if (gisWorkerSlot().urlOverride != null) return resolveOverrideGisWorkerUrl();
  return new URL(
    /* @vite-ignore */ 'assets/geojson.worker.js',
    import.meta.url,
  );
}

const DATA_SIZE_HINT =
  'data may be too large, too deeply nested, or contain circular references. Try a smaller file or data already in EPSG:4326.';

function errorFromWorkerMessage(raw?: string): Error {
  const text = raw?.trim() || 'GIS worker failed';
  const stackOverflow = isCallStackOverflow(text);
  const looksCrs =
    /reproject|clone GeoJSON|circular|too deeply nested|CRS|EPSG/i.test(text);

  if (stackOverflow) {
    return new MapError(
      `GIS worker failed: ${DATA_SIZE_HINT}`,
      'CRS_ERROR',
      {
        recoverable: false,
        context: {
          stage: 'worker',
          reason: 'too_deep_or_circular_or_large',
        },
      },
    );
  }

  if (looksCrs) {
    return new MapError(text, 'CRS_ERROR', {
      recoverable: false,
      context: { stage: 'worker', reason: 'worker_failed' },
    });
  }

  return new Error(text);
}

const gisWorker = connectWorkerMonitor<
  GeojsonWorkerRequest,
  GeojsonWorkerResponse
>({
  id: GEOJSON_WORKER_ID,
  name: 'GIS',
  createWorker: () => {
    if (gisWorkerSlot().urlOverride != null) {
      return new Worker(resolveOverrideGisWorkerUrl(), { type: 'module' });
    }
    // Static `new Worker(new URL('./geojson.worker.ts', import.meta.url))` is
    // required so Vite lib-build emits `assets/geojson.worker.js` (not a data: URL).
    return new Worker(new URL('./geojson.worker.ts', import.meta.url), {
      type: 'module',
    });
  },
  mapError: errorFromWorkerMessage,
  prepareRequest: (payload) => {
    if (
      payload.type === 'reproject-geojson' ||
      payload.type === 'detect-style-types' ||
      payload.type === 'compute-bbox'
    ) {
      return {
        ...payload,
        geojson: toPlainJson(payload.geojson),
      };
    }
    return payload;
  },
});

function fromWorkerResponse(response: GeojsonWorkerResponse): GisLoadResult {
  return {
    geojson: response.geojson ?? null,
    crs: response.crs ?? null,
    format: response.format as GisLoadResult['format'],
  };
}

export async function loadGisTextAsync(
  text: string,
  filename?: string,
): Promise<GisLoadResult> {
  const trimmed = text.trim();
  if (!trimmed) return { geojson: null, crs: null };

  return gisWorker.runTask(
    'parse-gis',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await gisWorker.post({
          id: taskId,
          type: 'parse-gis',
          text: trimmed,
          filename,
        });
        return fromWorkerResponse(response);
      },
    },
    {
      engine: 'main',
      run: async () =>
        parseGisTextAsync(trimmed, { name: filename, strict: true }),
    },
  );
}

export async function loadGisFileAsync(
  file: Blob | File | Array<Blob | File>,
): Promise<GisLoadResult> {
  const files = Array.isArray(file) ? file : [file];
  if (!files.length) return { geojson: null, crs: null };

  const taskType = files.length > 1 ? 'read-gis-files' : 'read-gis';
  return gisWorker.runTask(
    taskType,
    {
      engine: 'worker',
      run: async (taskId) => {
        const response =
          files.length > 1
            ? await gisWorker.post({
                id: taskId,
                type: 'read-gis-files',
                files: files as File[],
              })
            : await gisWorker.post({
                id: taskId,
                type: 'read-gis',
                file: files[0] as File,
              });
        return fromWorkerResponse(response);
      },
    },
    {
      engine: 'main',
      run: async () => parseGisFiles(files),
    },
  );
}

export async function loadGisUrlAsync(url: string): Promise<GisLoadResult> {
  const trimmed = url.trim();
  if (!trimmed) return { geojson: null, crs: null };

  return gisWorker.runTask(
    'fetch-gis',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await gisWorker.post({
          id: taskId,
          type: 'fetch-gis',
          url: trimmed,
        });
        return fromWorkerResponse(response);
      },
    },
    {
      engine: 'main',
      run: async () => parseGisFromUrl(trimmed),
    },
  );
}

export async function loadGeojsonTextAsync(text: string): Promise<GisLoadResult> {
  return loadGisTextAsync(text);
}

export async function loadGeojsonFileAsync(
  file: Blob | File | Array<Blob | File>,
): Promise<GisLoadResult> {
  return loadGisFileAsync(file);
}

/** Parse in worker when available; returns GeoJSON only. */
export async function parseGeojsonTextAsync(text: string): Promise<GeoJSON | null> {
  return (await loadGisTextAsync(text)).geojson;
}

export async function reprojectGeojsonAsync(
  geojson: GeoJSON,
  fromCrs?: string | null,
  toCrs?: string | null,
): Promise<GeoJSON> {
  const from = normalizeEpsgCode(fromCrs) ?? '4326';
  const to = normalizeEpsgCode(toCrs) ?? '4326';
  if (from === to) return geojson;

  return gisWorker.runTask(
    'reproject-geojson',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await gisWorker.post({
          id: taskId,
          type: 'reproject-geojson',
          geojson,
          crs: from,
          toCrs: to,
        });
        return response.geojson ?? geojson;
      },
    },
    {
      engine: 'main',
      run: async (taskId) =>
        reprojectGeojson(geojson, from, to, (current, total) => {
          gisWorker.handle.setProgress(taskId, {
            current,
            total,
            message: 'reproject',
          });
        }),
    },
  );
}

export async function reprojectGeojsonToWgs84Async(
  geojson: GeoJSON,
  crs?: string | null,
): Promise<GeoJSON> {
  return reprojectGeojsonAsync(geojson, crs, '4326');
}

/**
 * Detect style types (point/line/area) present in GeoJSON.
 * Large FeatureCollections run on the GIS worker when available.
 */
export async function detectGeojsonStyleTypesAsync(
  geojson: GeoJSON,
): Promise<LayerStyleType[]> {
  const plain = toPlainJson(geojson);
  if (!shouldUseGisWorkerForGeojson(plain)) {
    return detectGeojsonStyleTypes(plain);
  }

  return gisWorker.runTask(
    'detect-style-types',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await gisWorker.post({
          id: taskId,
          type: 'detect-style-types',
          geojson: plain,
        });
        return response.styleTypes?.length
          ? response.styleTypes
          : detectGeojsonStyleTypes(plain);
      },
    },
    {
      engine: 'main',
      run: async () => detectGeojsonStyleTypes(plain),
    },
  );
}

/**
 * Turf bbox — always prefers the GIS worker (heavy MultiPolygons can be
 * one Feature but still expensive). Falls back to the main thread.
 */
export async function bboxFromGeojsonAsync(
  geojson: GeoJSON,
): Promise<GeojsonBbox | undefined> {
  const plain = toPlainJson(geojson);

  return gisWorker.runTask(
    'compute-bbox',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await gisWorker.post({
          id: taskId,
          type: 'compute-bbox',
          geojson: plain,
        });
        return response.bbox ?? bboxFromGeojson(plain);
      },
    },
    {
      engine: 'main',
      run: async () => bboxFromGeojson(plain),
    },
  );
}

export function terminateGeojsonWorker(): void {
  gisWorker.terminate('GIS worker terminated');
}
