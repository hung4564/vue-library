import type { GeoJSON } from 'geojson';
import {
  bboxFromGeojson,
  isCallStackOverflow,
  MapError,
  normalizeEpsgCode,
  reprojectGeojsonToWgs84,
  toPlainJson,
  WorkerMonitor,
  type GeojsonBbox,
} from '@hungpvq/map-core';
import {
  detectGeojsonStyleTypes,
  shouldUseGisWorkerForGeojson,
} from './geojson-parse';
import type { LayerStyleType } from '../../utils/layer-simple-builder';
import { parseGisFiles, parseGisFromUrl, parseGisText } from './gis-parse';
import type { GisLoadResult } from './gis-parse';
import type {
  GeojsonWorkerRequest,
  GeojsonWorkerResponse,
} from './geojson.worker';

const GEOJSON_WORKER_ID = 'geojson';

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

const gisWorker = WorkerMonitor.connect<
  GeojsonWorkerRequest,
  GeojsonWorkerResponse
>({
  id: GEOJSON_WORKER_ID,
  name: 'GIS',
  createWorker: () =>
    new Worker(new URL('./geojson.worker.ts', import.meta.url), {
      type: 'module',
    }),
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
      run: async () => parseGisText(trimmed, { name: filename, strict: true }),
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

export async function reprojectGeojsonToWgs84Async(
  geojson: GeoJSON,
  crs?: string | null,
): Promise<GeoJSON> {
  const epsg = normalizeEpsgCode(crs) ?? '4326';
  if (epsg === '4326') return geojson;

  return gisWorker.runTask(
    'reproject-geojson',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await gisWorker.post({
          id: taskId,
          type: 'reproject-geojson',
          geojson,
          crs: epsg,
        });
        return response.geojson ?? geojson;
      },
    },
    {
      engine: 'main',
      run: async (taskId) =>
        reprojectGeojsonToWgs84(geojson, epsg, (current, total) => {
          gisWorker.handle.setProgress(taskId, {
            current,
            total,
            message: 'reproject',
          });
        }),
    },
  );
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
