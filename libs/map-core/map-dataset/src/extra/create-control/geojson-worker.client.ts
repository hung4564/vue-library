import type { GeoJSON } from 'geojson';
import {
  applyWorkerMonitorMessage,
  bboxFromGeojson,
  isCallStackOverflow,
  MapError,
  normalizeEpsgCode,
  reprojectGeojsonToWgs84,
  runMonitoredTask,
  toPlainJson,
  WorkerMonitor,
  type GeojsonBbox,
} from '@hungpvq/map-core';
import {
  detectGeojsonStyleTypes,
  shouldUseGisWorkerForGeojson,
} from './geojson-parse';
import type { LayerStyleType } from '../../utils/layer-simple-builder';
import { parseGisFile, parseGisFiles, parseGisFromUrl, parseGisText } from './gis-parse';
import type { GisLoadResult } from './gis-parse';
import type {
  GeojsonWorkerRequest,
  GeojsonWorkerResponse,
} from './geojson.worker';

export const GEOJSON_WORKER_ID = 'geojson';

export type GeojsonLoadResult = GisLoadResult;

type PendingTask = {
  resolve: (value: GeojsonWorkerResponse) => void;
  reject: (reason?: unknown) => void;
};

const geojsonWorker = WorkerMonitor.register(GEOJSON_WORKER_ID, {
  name: 'GIS',
});

let worker: Worker | null = null;
let workerUnavailable = false;
const pending = new Map<string, PendingTask>();

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
function getWorker(): Worker | null {
  if (workerUnavailable || typeof Worker === 'undefined') {
    return null;
  }
  if (worker) return worker;

  try {
    worker = new Worker(new URL('./geojson.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (event: MessageEvent<unknown>) => {
      if (applyWorkerMonitorMessage(GEOJSON_WORKER_ID, event.data)) return;
      const data = event.data as GeojsonWorkerResponse;
      const task = pending.get(data.id);
      if (!task) return;
      pending.delete(data.id);
      if (data.ok) {
        task.resolve(data);
        return;
      }
      task.reject(errorFromWorkerMessage(data.error));
    };
    worker.onerror = () => {
      workerUnavailable = true;
      geojsonWorker.setStatus('unavailable');
      geojsonWorker.setLastError('GIS worker crashed');
      geojsonWorker.log({
        level: 'error',
        message: 'GIS worker crashed',
      });
      worker?.terminate();
      worker = null;
      for (const [id, task] of pending) {
        geojsonWorker.failTask(id, 'GIS worker crashed', {
          engine: 'worker',
          fallback: true,
        });
        task.reject(new Error('GIS worker crashed'));
      }
      pending.clear();
    };
    if (geojsonWorker.snapshot().pending.length === 0) {
      geojsonWorker.setStatus('idle');
    }
    geojsonWorker.log({ level: 'info', message: 'GIS worker started' });
    return worker;
  } catch (error) {
    workerUnavailable = true;
    geojsonWorker.setStatus('unavailable');
    geojsonWorker.setLastError(
      error instanceof Error ? error.message : 'GIS worker failed to start',
    );
    geojsonWorker.log({
      level: 'error',
      message:
        error instanceof Error
          ? `GIS worker failed to start: ${error.message}`
          : 'GIS worker failed to start',
    });
    return null;
  }
}

function postToWorker(payload: GeojsonWorkerRequest): Promise<GeojsonWorkerResponse> {
  const instance = getWorker();
  if (!instance) {
    return Promise.reject(new Error('GIS worker unavailable'));
  }

  const message =
    payload.type === 'reproject-geojson' ||
    payload.type === 'detect-style-types' ||
    payload.type === 'compute-bbox'
      ? {
          ...payload,
          geojson: toPlainJson(payload.geojson),
        }
      : payload;
  return new Promise<GeojsonWorkerResponse>((resolve, reject) => {
    pending.set(payload.id, { resolve, reject });
    instance.postMessage(message);
  });
}

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

  return runMonitoredTask(
    GEOJSON_WORKER_ID,
    'parse-gis',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await postToWorker({
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
  return runMonitoredTask(
    GEOJSON_WORKER_ID,
    taskType,
    {
      engine: 'worker',
      run: async (taskId) => {
        const response =
          files.length > 1
            ? await postToWorker({
                id: taskId,
                type: 'read-gis-files',
                files: files as File[],
              })
            : await postToWorker({
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

  return runMonitoredTask(
    GEOJSON_WORKER_ID,
    'fetch-gis',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await postToWorker({
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

  return runMonitoredTask(
    GEOJSON_WORKER_ID,
    'reproject-geojson',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await postToWorker({
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
          geojsonWorker.setProgress(taskId, {
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

  return runMonitoredTask(
    GEOJSON_WORKER_ID,
    'detect-style-types',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await postToWorker({
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

  return runMonitoredTask(
    GEOJSON_WORKER_ID,
    'compute-bbox',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await postToWorker({
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
  worker?.terminate();
  worker = null;
  workerUnavailable = false;
  for (const [id, task] of pending) {
    geojsonWorker.failTask(id, 'GIS worker terminated', {
      engine: 'worker',
      fallback: true,
    });
    task.reject(new Error('GIS worker terminated'));
  }
  pending.clear();
  geojsonWorker.setStatus('terminated');
  geojsonWorker.setLastError(undefined);
}
